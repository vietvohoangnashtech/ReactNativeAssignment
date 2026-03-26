import {networkService} from '../network/NetworkService';
import {syncQueueRepository} from '../database/repositories/syncQueueRepository';
import {SyncOperationModel} from '../database/models/SyncOperationModel';
import apiClient from '../api/client';
import type {SyncStatusValue} from './SyncStatus';

type StatusListener = (status: SyncStatusValue) => void;

const MAX_RETRIES = 3;
const PERIODIC_SYNC_MS = 5 * 60 * 1000; // 5 minutes
const BACKOFF_BASE_MS = 1000;
const BACKOFF_MAX_MS = 30000;

class SyncService {
  private listeners: Set<StatusListener> = new Set();
  private _status: SyncStatusValue = 'idle';
  private periodicTimer: ReturnType<typeof setInterval> | null = null;
  private networkUnsubscribe: (() => void) | null = null;
  private isSyncing = false;

  get status(): SyncStatusValue {
    return this._status;
  }

  start(): void {
    this.networkUnsubscribe = networkService.onStatusChange(isOnline => {
      if (isOnline) {
        this.sync();
      }
    });

    this.periodicTimer = setInterval(() => {
      if (networkService.isOnline) {
        this.sync();
      }
    }, PERIODIC_SYNC_MS);
  }

  stop(): void {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = null;
    }
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
      this.periodicTimer = null;
    }
  }

  onStatusChange(callback: StatusListener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  async sync(): Promise<void> {
    if (this.isSyncing || !networkService.isOnline) {return;}

    this.isSyncing = true;
    this.setStatus('syncing');

    try {
      const pending = await syncQueueRepository.getPending();

      for (const op of pending) {
        if (!networkService.isOnline) {break;}
        await this.processOperation(op);
      }

      this.setStatus('completed');
    } catch {
      this.setStatus('error');
    } finally {
      this.isSyncing = false;
    }
  }

  private async processOperation(op: SyncOperationModel): Promise<void> {
    if (op.retryCount >= MAX_RETRIES) {
      await syncQueueRepository.markDead(op);
      return;
    }

    await syncQueueRepository.markProcessing(op);

    try {
      const payload = JSON.parse(op.payload);
      const endpoint = this.getEndpoint(op.entityType, op.entityId, op.operation);
      const method = this.getMethod(op.operation);

      await apiClient.request({
        method,
        url: endpoint,
        data: payload,
        headers: {'X-Idempotency-Key': op.idempotencyKey},
      });

      await syncQueueRepository.markCompleted(op);
    } catch (error: unknown) {
      const status = (error as {response?: {status?: number}})?.response?.status;
      // Don't retry on 4xx client errors (except 408/429)
      if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
        await syncQueueRepository.markDead(op);
        return;
      }

      await syncQueueRepository.markFailed(op);

      // Backoff before next retry
      const delay = Math.min(BACKOFF_BASE_MS * Math.pow(2, op.retryCount), BACKOFF_MAX_MS);
      await new Promise<void>(resolve => setTimeout(resolve, delay));
    }
  }

  private getEndpoint(entityType: string, entityId: string, operation: string): string {
    const basePaths: Record<string, string> = {
      cart: '/sync/cart',
      order: '/orders',
      profile: '/users/profile',
      review: '/products',
    };
    const base = basePaths[entityType] || `/${entityType}`;

    if (operation === 'create') {return base;}
    return `${base}/${entityId}`;
  }

  private getMethod(operation: string): string {
    switch (operation) {
      case 'create': return 'POST';
      case 'update': return 'PUT';
      case 'delete': return 'DELETE';
      default: return 'POST';
    }
  }

  private setStatus(status: SyncStatusValue): void {
    this._status = status;
    this.listeners.forEach(cb => cb(status));
  }
}

export const syncService = new SyncService();

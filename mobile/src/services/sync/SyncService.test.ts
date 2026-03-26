import {syncService} from './SyncService';
import {networkService} from '../network/NetworkService';
import {syncQueueRepository} from '../database/repositories/syncQueueRepository';
import apiClient from '../api/client';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../network/NetworkService', () => ({
  networkService: {
    isOnline: true,
    onStatusChange: jest.fn(() => jest.fn()),
  },
}));

jest.mock('../database/repositories/syncQueueRepository', () => ({
  syncQueueRepository: {
    getPending: jest.fn(),
    markProcessing: jest.fn(),
    markCompleted: jest.fn(),
    markFailed: jest.fn(),
    markDead: jest.fn(),
    getPendingCount: jest.fn(),
  },
}));

jest.mock('../api/client', () => ({
  request: jest.fn(),
}));

const mockedNetwork = networkService as any;
const mockedQueue = syncQueueRepository as jest.Mocked<typeof syncQueueRepository>;
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockedNetwork.isOnline = true;
    syncService.stop();
  });

  afterEach(() => {
    syncService.stop();
    jest.useRealTimers();
  });

  it('should default to idle status', () => {
    expect(syncService.status).toBe('idle');
  });

  describe('start/stop', () => {
    it('should register network listener on start', () => {
      syncService.start();
      expect(mockedNetwork.onStatusChange).toHaveBeenCalledTimes(1);
    });

    it('should unregister on stop', () => {
      const unsub = jest.fn();
      mockedNetwork.onStatusChange.mockReturnValue(unsub);
      syncService.start();
      syncService.stop();
      expect(unsub).toHaveBeenCalled();
    });
  });

  describe('sync', () => {
    it('should skip sync when offline', async () => {
      mockedNetwork.isOnline = false;
      await syncService.sync();
      expect(mockedQueue.getPending).not.toHaveBeenCalled();
    });

    it('should process pending operations', async () => {
      const mockOp = {
        id: '1',
        entityType: 'profile',
        entityId: '42',
        operation: 'update',
        payload: JSON.stringify({firstName: 'Jane'}),
        retryCount: 0,
        status: 'pending',
        idempotencyKey: 'key-1',
      };
      mockedQueue.getPending.mockResolvedValue([mockOp as any]);
      mockedQueue.markProcessing.mockResolvedValue(undefined);
      mockedQueue.markCompleted.mockResolvedValue(undefined);
      mockedApiClient.request.mockResolvedValue({data: {}});

      await syncService.sync();

      expect(mockedQueue.markProcessing).toHaveBeenCalledWith(mockOp);
      expect(mockedApiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: '/users/profile/42',
          data: {firstName: 'Jane'},
          headers: {'X-Idempotency-Key': 'key-1'},
        }),
      );
      expect(mockedQueue.markCompleted).toHaveBeenCalledWith(mockOp);
    });

    it('should mark dead when retryCount >= MAX_RETRIES', async () => {
      const mockOp = {
        id: '1',
        entityType: 'order',
        entityId: '10',
        operation: 'create',
        payload: '{}',
        retryCount: 3,
        status: 'pending',
        idempotencyKey: 'key-2',
      };
      mockedQueue.getPending.mockResolvedValue([mockOp as any]);
      mockedQueue.markDead.mockResolvedValue(undefined);

      await syncService.sync();

      expect(mockedQueue.markDead).toHaveBeenCalledWith(mockOp);
      expect(mockedApiClient.request).not.toHaveBeenCalled();
    });

    it('should mark dead on 4xx client error (not 408/429)', async () => {
      const mockOp = {
        id: '1',
        entityType: 'cart',
        entityId: '',
        operation: 'create',
        payload: '{}',
        retryCount: 0,
        status: 'pending',
        idempotencyKey: 'key-3',
      };
      mockedQueue.getPending.mockResolvedValue([mockOp as any]);
      mockedQueue.markProcessing.mockResolvedValue(undefined);
      mockedQueue.markDead.mockResolvedValue(undefined);
      mockedApiClient.request.mockRejectedValue({response: {status: 400}});

      await syncService.sync();

      expect(mockedQueue.markDead).toHaveBeenCalledWith(mockOp);
    });

    it('should mark failed and backoff on server error', async () => {
      const mockOp = {
        id: '1',
        entityType: 'cart',
        entityId: '',
        operation: 'create',
        payload: '{}',
        retryCount: 0,
        status: 'pending',
        idempotencyKey: 'key-4',
      };
      mockedQueue.getPending.mockResolvedValue([mockOp as any]);
      mockedQueue.markProcessing.mockResolvedValue(undefined);
      mockedQueue.markFailed.mockResolvedValue(undefined);
      mockedApiClient.request.mockRejectedValue({response: {status: 500}});

      const syncPromise = syncService.sync();
      await jest.runAllTimersAsync();
      await syncPromise;

      expect(mockedQueue.markFailed).toHaveBeenCalledWith(mockOp);
    }, 10000);

    it('should notify listeners of status changes', async () => {
      mockedQueue.getPending.mockResolvedValue([]);
      const listener = jest.fn();
      const unsub = syncService.onStatusChange(listener);

      await syncService.sync();

      const statuses = listener.mock.calls.map((c: any[]) => c[0]);
      expect(statuses).toContain('syncing');
      expect(statuses).toContain('completed');
      unsub();
    });
  });

  describe('getEndpoint', () => {
    it('should build correct endpoints for different entity types', async () => {
      const ops = [
        {entityType: 'cart', entityId: '', operation: 'create', payload: '{}', retryCount: 0, idempotencyKey: 'k1'},
        {entityType: 'order', entityId: '5', operation: 'update', payload: '{}', retryCount: 0, idempotencyKey: 'k2'},
        {entityType: 'review', entityId: '3', operation: 'update', payload: '{}', retryCount: 0, idempotencyKey: 'k3'},
      ];

      // Process all ops in one sync call
      mockedQueue.getPending.mockResolvedValue(ops as any);
      mockedQueue.markProcessing.mockResolvedValue(undefined);
      mockedQueue.markCompleted.mockResolvedValue(undefined);
      mockedApiClient.request.mockResolvedValue({data: {}});

      await syncService.sync();

      const calls = mockedApiClient.request.mock.calls;
      expect(calls).toHaveLength(3);
      expect(calls[0][0].url).toBe('/sync/cart');
      expect(calls[1][0].url).toBe('/orders/5');
      expect(calls[2][0].url).toBe('/products/3');
    });
  });
});

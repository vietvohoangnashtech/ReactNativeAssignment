import {Q} from '@nozbe/watermelondb';
import {database} from '../database';
import {SyncOperationModel} from '../models/SyncOperationModel';

const collection = database.get<SyncOperationModel>('sync_operations');

function generateUUID(): string {
  let d = Date.now();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    // eslint-disable-next-line no-bitwise
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface EnqueueParams {
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
}

export const syncQueueRepository = {
  async enqueue(params: EnqueueParams): Promise<SyncOperationModel> {
    return database.write(async () => {
      return collection.create(record => {
        record.entityType = params.entityType;
        record.entityId = params.entityId;
        record.operation = params.operation;
        record.payload = JSON.stringify(params.payload);
        record.createdAt = Date.now();
        record.retryCount = 0;
        record.status = 'pending';
        record.idempotencyKey = generateUUID();
      });
    });
  },

  async getPending(): Promise<SyncOperationModel[]> {
    return collection.query(
      Q.where('status', 'pending'),
      Q.sortBy('created_at', Q.asc),
    ).fetch();
  },

  async markProcessing(op: SyncOperationModel): Promise<void> {
    await database.write(async () => {
      await op.update(record => {
        record.status = 'processing';
      });
    });
  },

  async markCompleted(op: SyncOperationModel): Promise<void> {
    await database.write(async () => {
      await op.destroyPermanently();
    });
  },

  async markFailed(op: SyncOperationModel): Promise<void> {
    await database.write(async () => {
      await op.update(record => {
        record.status = 'pending';
        record.retryCount = (record.retryCount || 0) + 1;
      });
    });
  },

  async markDead(op: SyncOperationModel): Promise<void> {
    await database.write(async () => {
      await op.update(record => {
        record.status = 'dead';
      });
    });
  },

  async getPendingCount(): Promise<number> {
    return collection.query(Q.where('status', 'pending')).fetchCount();
  },

  async clearAll(): Promise<void> {
    const all = await collection.query().fetch();
    await database.write(async () => {
      for (const op of all) {
        await op.destroyPermanently();
      }
    });
  },
};

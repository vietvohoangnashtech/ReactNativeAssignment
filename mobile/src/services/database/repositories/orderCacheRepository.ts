import {database} from '../database';
import {CachedOrderModel} from '../models/CachedOrderModel';
import type {Order} from '../../../features/orders/types/order.types';

const collection = database.get<CachedOrderModel>('cached_orders');

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

export const orderCacheRepository = {
  async cacheOrders(orders: Order[]): Promise<void> {
    await database.write(async () => {
      const existing = await collection.query().fetch();
      const syncedOnly = existing.filter(r => r.localSyncStatus === 'synced');
      const deletions = syncedOnly.map(r => r.prepareDestroyPermanently());
      const now = Date.now();
      const creations = orders.map(o =>
        collection.prepareCreate(record => {
          record.orderId = o.id;
          record.status = o.status;
          record.totalPrice = o.totalAmount;
          record.itemsJson = JSON.stringify(o.items);
          record.localSyncStatus = 'synced';
          record.idempotencyKey = '';
          record.cachedAt = now;
        }),
      );
      await database.batch(...deletions, ...creations);
    });
  },

  async getCachedOrders(): Promise<Order[]> {
    const records = await collection.query().fetch();
    return records.map(r => ({
      id: r.orderId || 0,
      userId: 0,
      items: JSON.parse(r.itemsJson || '[]'),
      totalAmount: r.totalPrice,
      status: r.status,
      createdAt: new Date(r.cachedAt).toISOString(),
    }));
  },

  async createPendingOrder(items: {productId: number; quantity: number; price: number}[], totalAmount: number): Promise<string> {
    const idempotencyKey = generateUUID();
    await database.write(async () => {
      await collection.create(record => {
        record.orderId = 0;
        record.status = 'pending_local';
        record.totalPrice = totalAmount;
        record.itemsJson = JSON.stringify(items);
        record.localSyncStatus = 'pending';
        record.idempotencyKey = idempotencyKey;
        record.cachedAt = Date.now();
      });
    });
    return idempotencyKey;
  },

  async clearAll(): Promise<void> {
    await database.write(async () => {
      const records = await collection.query().fetch();
      await database.batch(...records.map(r => r.prepareDestroyPermanently()));
    });
  },
};

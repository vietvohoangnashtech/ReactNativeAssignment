import {Q} from '@nozbe/watermelondb';
import {database} from '../database';
import {RecentlyViewedModel} from '../models/RecentlyViewedModel';
import type {Product} from '../../../features/products/types/product.types';

const MAX_RECENTLY_VIEWED = 10;
const collection = database.get<RecentlyViewedModel>('recently_viewed');

export const recentlyViewedRepository = {
  async trackView(product: Product): Promise<void> {
    await database.write(async () => {
      // Remove existing entry for the same product (dedup)
      const existing = await collection
        .query(Q.where('product_id', product.id))
        .fetch();
      for (const record of existing) {
        await record.destroyPermanently();
      }

      // Create new entry with current timestamp
      await collection.create(record => {
        record.productId = product.id;
        record.name = product.name;
        record.price = Number(product.price);
        record.image = product.image ?? '';
        record.priceUnit = product.priceUnit;
        record.viewedAt = Date.now();
      });

      // Cap at MAX — remove oldest beyond limit
      const all = await collection
        .query(Q.sortBy('viewed_at', Q.desc))
        .fetch();
      if (all.length > MAX_RECENTLY_VIEWED) {
        const toRemove = all.slice(MAX_RECENTLY_VIEWED);
        await database.batch(
          ...toRemove.map(r => r.prepareDestroyPermanently()),
        );
      }
    });
  },

  async getRecentlyViewed(): Promise<Product[]> {
    const records = await collection
      .query(Q.sortBy('viewed_at', Q.desc))
      .fetch();
    return records.map(r => ({
      id: r.productId,
      name: r.name,
      price: r.price,
      image: r.image !== '' ? r.image : '',
      priceUnit: r.priceUnit as Product['priceUnit'],
      description: '',
    }));
  },

  async clearHistory(): Promise<void> {
    await database.write(async () => {
      const records = await collection.query().fetch();
      if (records.length > 0) {
        await database.batch(
          ...records.map(r => r.prepareDestroyPermanently()),
        );
      }
    });
  },
};

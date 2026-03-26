import {Q} from '@nozbe/watermelondb';
import {database} from '../database';
import {SearchHistoryModel} from '../models/SearchHistoryModel';

const MAX_HISTORY = 20;
const collection = database.get<SearchHistoryModel>('search_history');

export const searchHistoryRepository = {
  async saveQuery(query: string): Promise<void> {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return;
    }

    await database.write(async () => {
      // Remove existing entry with same query (dedup)
      const existing = await collection
        .query(Q.where('query', trimmed))
        .fetch();
      for (const record of existing) {
        await record.destroyPermanently();
      }

      // Create new entry
      await collection.create(record => {
        record.query = trimmed;
        record.searchedAt = Date.now();
      });

      // Cap at MAX_HISTORY — remove oldest beyond limit
      const all = await collection
        .query(Q.sortBy('searched_at', Q.desc))
        .fetch();
      if (all.length > MAX_HISTORY) {
        const toRemove = all.slice(MAX_HISTORY);
        await database.batch(
          ...toRemove.map(r => r.prepareDestroyPermanently()),
        );
      }
    });
  },

  async getHistory(): Promise<string[]> {
    const records = await collection
      .query(Q.sortBy('searched_at', Q.desc))
      .fetch();
    return records.map(r => r.query);
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

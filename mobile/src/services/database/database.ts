import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {schema} from './schema';
import {migrations} from './migrations';
import {ProfileModel} from './models/ProfileModel';
import {CartItemModel} from './models/CartItemModel';
import {SearchHistoryModel} from './models/SearchHistoryModel';
import {RecentlyViewedModel} from './models/RecentlyViewedModel';
import {SyncOperationModel} from './models/SyncOperationModel';
import {CachedProductModel} from './models/CachedProductModel';
import {CachedCategoryModel} from './models/CachedCategoryModel';
import {CachedOrderModel} from './models/CachedOrderModel';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  onSetUpError: (error: Error) => {
    console.error('[WatermelonDB] Setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    ProfileModel,
    CartItemModel,
    SearchHistoryModel,
    RecentlyViewedModel,
    SyncOperationModel,
    CachedProductModel,
    CachedCategoryModel,
    CachedOrderModel,
  ],
});

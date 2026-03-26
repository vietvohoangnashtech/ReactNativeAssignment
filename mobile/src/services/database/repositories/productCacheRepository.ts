import {database} from '../database';
import {CachedProductModel} from '../models/CachedProductModel';
import {CachedCategoryModel} from '../models/CachedCategoryModel';
import type {Product} from '../../../features/products/types/product.types';

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const productCollection = database.get<CachedProductModel>('cached_products');
const categoryCollection = database.get<CachedCategoryModel>('cached_categories');

export const productCacheRepository = {
  async cacheProducts(products: Product[]): Promise<void> {
    await database.write(async () => {
      const existing = await productCollection.query().fetch();
      const deletions = existing.map(r => r.prepareDestroyPermanently());
      const now = Date.now();
      const creations = products.map(p =>
        productCollection.prepareCreate(record => {
          record.productId = p.id;
          record.name = p.name;
          record.price = Number(p.price);
          record.description = p.description ?? '';
          record.image = p.image ?? '';
          record.category = p.category ?? '';
          record.priceUnit = p.priceUnit ?? 'dollar';
          record.cachedAt = now;
        }),
      );
      await database.batch(...deletions, ...creations);
    });
  },

  async getCachedProducts(): Promise<{products: Product[]; isStale: boolean} | null> {
    const records = await productCollection.query().fetch();
    if (records.length === 0) {return null;}

    const oldest = Math.min(...records.map(r => r.cachedAt));
    const isStale = Date.now() - oldest > CACHE_EXPIRY_MS;

    const products: Product[] = records.map(r => ({
      id: r.productId,
      name: r.name,
      price: r.price,
      description: r.description,
      image: r.image || '',
      priceUnit: r.priceUnit as Product['priceUnit'],
      category: r.category,
    }));

    return {products, isStale};
  },

  async cacheCategories(categories: {id: number; name: string}[]): Promise<void> {
    await database.write(async () => {
      const existing = await categoryCollection.query().fetch();
      const deletions = existing.map(r => r.prepareDestroyPermanently());
      const now = Date.now();
      const creations = categories.map(c =>
        categoryCollection.prepareCreate(record => {
          record.categoryId = c.id;
          record.name = c.name;
          record.cachedAt = now;
        }),
      );
      await database.batch(...deletions, ...creations);
    });
  },

  async getCachedCategories(): Promise<{id: number; name: string}[] | null> {
    const records = await categoryCollection.query().fetch();
    if (records.length === 0) {return null;}
    return records.map(r => ({id: r.categoryId, name: r.name}));
  },

  async clearAll(): Promise<void> {
    await database.write(async () => {
      const products = await productCollection.query().fetch();
      const categories = await categoryCollection.query().fetch();
      await database.batch(
        ...products.map(r => r.prepareDestroyPermanently()),
        ...categories.map(r => r.prepareDestroyPermanently()),
      );
    });
  },
};

import {configureStore} from '@reduxjs/toolkit';
import productsReducer, {
  fetchProducts,
  fetchProductById,
  fetchProductReviews,
  clearSelectedProduct,
} from './productsSlice';
import {productService} from '../services/productService';
import {productCacheRepository} from '../../../services/database/repositories/productCacheRepository';
import type {Product, ProductReview} from '../types/product.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../services/productService');
jest.mock('../../../services/database/repositories/productCacheRepository', () => ({
  productCacheRepository: {
    getCachedProducts: jest.fn(),
    cacheProducts: jest.fn(),
  },
}));
const mockedProductService = productService as jest.Mocked<typeof productService>;
const mockedCache = productCacheRepository as jest.Mocked<typeof productCacheRepository>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  description: 'A test product',
  image: 'https://example.com/image.jpg',
  price: 49.99,
  priceUnit: 'dollar',
  category: 'Electronics',
};

const mockProduct2: Product = {
  id: 2,
  name: 'Another Product',
  description: 'Another desc',
  image: 'https://example.com/image2.jpg',
  price: 19.99,
  priceUnit: 'dollar',
};

const mockReview: ProductReview = {
  id: 10,
  productId: 1,
  userId: 5,
  rating: 4,
  message: 'Great product!',
  createdAt: '2025-01-01T00:00:00.000Z',
  User: {username: 'testuser', firstName: 'Test', lastName: 'User'},
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeStore() {
  return configureStore({reducer: {products: productsReducer}});
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('productsSlice reducer', () => {
  describe('clearSelectedProduct', () => {
    it('should clear selectedProduct and reviews', () => {
      const store = configureStore({
        reducer: {products: productsReducer},
        preloadedState: {
          products: {
            items: [],
            selectedProduct: mockProduct,
            reviews: [mockReview],
            loading: false,
            reviewsLoading: false,
            error: null,
            isOffline: false,
            isStale: false,
          },
        },
      });
      store.dispatch(clearSelectedProduct());
      const state = store.getState().products;
      expect(state.selectedProduct).toBeNull();
      expect(state.reviews).toHaveLength(0);
    });
  });

  describe('fetchProducts thunk', () => {
    beforeEach(() => {
      mockedProductService.getProducts.mockReset();
      mockedCache.getCachedProducts.mockReset();
      mockedCache.cacheProducts.mockReset();
    });

    it('should populate items and set loading=false on fulfilled', async () => {
      mockedCache.getCachedProducts.mockResolvedValue(null);
      mockedCache.cacheProducts.mockResolvedValue(undefined);
      mockedProductService.getProducts.mockResolvedValue([mockProduct, mockProduct2]);
      const store = makeStore();
      await store.dispatch(fetchProducts());
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      expect(state.items).toHaveLength(2);
      expect(state.items[0]?.id).toBe(1);
      expect(state.isOffline).toBe(false);
    });

    it('should fall back to cache when API fails', async () => {
      mockedCache.getCachedProducts.mockResolvedValue({products: [mockProduct], isStale: true});
      mockedProductService.getProducts.mockRejectedValue(new Error('Network error'));
      const store = makeStore();
      await store.dispatch(fetchProducts());
      const state = store.getState().products;
      expect(state.items).toHaveLength(1);
      expect(state.isOffline).toBe(true);
    });

    it('should set error when API fails and no cache', async () => {
      mockedCache.getCachedProducts.mockResolvedValue(null);
      mockedProductService.getProducts.mockRejectedValue(new Error('Network error'));
      const store = makeStore();
      await store.dispatch(fetchProducts());
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to load products');
    });
  });

  describe('fetchProductById thunk', () => {
    beforeEach(() => {
      mockedProductService.getProductById.mockReset();
    });

    it('should set selectedProduct on fulfilled', async () => {
      mockedProductService.getProductById.mockResolvedValue(mockProduct);
      const store = makeStore();
      await store.dispatch(fetchProductById(1));
      expect(store.getState().products.selectedProduct).toEqual(mockProduct);
    });
  });

  describe('fetchProductReviews thunk', () => {
    beforeEach(() => {
      mockedProductService.getProductReviews.mockReset();
    });

    it('should set reviewsLoading=true on pending', () => {
      const store = makeStore();
      store.dispatch({type: fetchProductReviews.pending.type});
      expect(store.getState().products.reviewsLoading).toBe(true);
    });

    it('should populate reviews and set reviewsLoading=false on fulfilled', async () => {
      mockedProductService.getProductReviews.mockResolvedValue([mockReview]);
      const store = makeStore();
      await store.dispatch(fetchProductReviews(1));
      const state = store.getState().products;
      expect(state.reviewsLoading).toBe(false);
      expect(state.reviews).toHaveLength(1);
      expect(state.reviews[0]?.rating).toBe(4);
    });

    it('should set reviewsLoading=false on rejected', async () => {
      mockedProductService.getProductReviews.mockRejectedValue(new Error('Fail'));
      const store = makeStore();
      await store.dispatch(fetchProductReviews(1));
      expect(store.getState().products.reviewsLoading).toBe(false);
    });
  });
});

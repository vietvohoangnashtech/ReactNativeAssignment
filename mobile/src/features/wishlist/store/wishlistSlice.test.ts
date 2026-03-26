import {configureStore} from '@reduxjs/toolkit';
import wishlistReducer, {
  fetchWishlist,
  toggleWishlist,
  clearWishlist,
  selectWishlistIds,
  selectIsWishlisted,
} from './wishlistSlice';
import {wishlistService} from '../services/wishlistService';

// ─── Mock ────────────────────────────────────────────────────────────────────

jest.mock('../services/wishlistService');
const mockedService = wishlistService as jest.Mocked<typeof wishlistService>;

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeStore() {
  return configureStore({reducer: {wishlist: wishlistReducer}});
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('wishlistSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const store = makeStore();
    expect(store.getState().wishlist).toEqual({
      productIds: [],
      loading: false,
      error: null,
    });
  });

  describe('clearWishlist', () => {
    it('should reset to initial state', () => {
      const store = configureStore({
        reducer: {wishlist: wishlistReducer},
        preloadedState: {
          wishlist: {productIds: [1, 2], loading: false, error: 'err'},
        },
      });
      store.dispatch(clearWishlist());
      expect(store.getState().wishlist).toEqual({
        productIds: [],
        loading: false,
        error: null,
      });
    });
  });

  describe('fetchWishlist', () => {
    it('should set loading on pending', () => {
      const store = makeStore();
      store.dispatch({type: fetchWishlist.pending.type});
      expect(store.getState().wishlist.loading).toBe(true);
      expect(store.getState().wishlist.error).toBeNull();
    });

    it('should populate productIds on fulfilled', async () => {
      mockedService.getWishlist.mockResolvedValue([
        {id: 1, userId: 1, productId: 10, createdAt: '2025-01-01'},
        {id: 2, userId: 1, productId: 20, createdAt: '2025-01-02'},
      ]);
      const store = makeStore();
      await store.dispatch(fetchWishlist());
      const state = store.getState().wishlist;
      expect(state.loading).toBe(false);
      expect(state.productIds).toEqual([10, 20]);
    });

    it('should set error on rejection', async () => {
      mockedService.getWishlist.mockRejectedValue(new Error('Network'));
      const store = makeStore();
      await store.dispatch(fetchWishlist());
      const state = store.getState().wishlist;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network');
    });
  });

  describe('toggleWishlist', () => {
    it('should add productId when wishlisted', async () => {
      mockedService.toggleWishlist.mockResolvedValue({
        wishlisted: true,
        productId: 10,
      });
      const store = makeStore();
      await store.dispatch(toggleWishlist(10));
      expect(store.getState().wishlist.productIds).toContain(10);
    });

    it('should remove productId when unwishlisted', async () => {
      mockedService.toggleWishlist.mockResolvedValue({
        wishlisted: false,
        productId: 10,
      });
      const store = configureStore({
        reducer: {wishlist: wishlistReducer},
        preloadedState: {
          wishlist: {productIds: [10, 20], loading: false, error: null},
        },
      });
      await store.dispatch(toggleWishlist(10));
      expect(store.getState().wishlist.productIds).toEqual([20]);
    });

    it('should not duplicate productId if already present', async () => {
      mockedService.toggleWishlist.mockResolvedValue({
        wishlisted: true,
        productId: 10,
      });
      const store = configureStore({
        reducer: {wishlist: wishlistReducer},
        preloadedState: {
          wishlist: {productIds: [10], loading: false, error: null},
        },
      });
      await store.dispatch(toggleWishlist(10));
      expect(store.getState().wishlist.productIds).toEqual([10]);
    });
  });

  describe('selectors', () => {
    it('selectWishlistIds returns productIds', () => {
      const state = {wishlist: {productIds: [1, 2], loading: false, error: null}};
      expect(selectWishlistIds(state)).toEqual([1, 2]);
    });

    it('selectIsWishlisted returns true when present', () => {
      const state = {wishlist: {productIds: [1, 2], loading: false, error: null}};
      expect(selectIsWishlisted(1)(state)).toBe(true);
      expect(selectIsWishlisted(99)(state)).toBe(false);
    });
  });
});

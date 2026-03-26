import {configureStore} from '@reduxjs/toolkit';
import ordersReducer, {fetchOrders} from './ordersSlice';
import {ordersService} from '../services/ordersService';
import {orderCacheRepository} from '../../../services/database/repositories/orderCacheRepository';
import type {Order} from '../types/order.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../services/ordersService');
jest.mock('../../../services/database/repositories/orderCacheRepository', () => ({
  orderCacheRepository: {
    cacheOrders: jest.fn(),
    getCachedOrders: jest.fn(),
  },
}));
const mockedOrdersService = ordersService as jest.Mocked<typeof ordersService>;
const mockedOrderCache = orderCacheRepository as jest.Mocked<typeof orderCacheRepository>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockOrder: Order = {
  id: 1,
  userId: 10,
  items: [{productId: 1, quantity: 2, price: 19.99}],
  totalAmount: 39.98,
  shippingAddress: '123 Main St',
  paymentMethod: 'credit_card',
  status: 'completed',
  createdAt: '2025-01-01T00:00:00.000Z',
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeStore() {
  return configureStore({reducer: {orders: ordersReducer}});
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ordersSlice reducer', () => {
  it('should return the correct initial state', () => {
    const store = makeStore();
    expect(store.getState().orders).toEqual({items: [], loading: false, error: null, isOffline: false});
  });

  describe('fetchOrders thunk', () => {
    beforeEach(() => {
      mockedOrdersService.getOrders.mockReset();
      mockedOrderCache.cacheOrders.mockReset();
      mockedOrderCache.getCachedOrders.mockReset();
    });

    it('should populate items and set loading=false on fulfilled', async () => {
      mockedOrdersService.getOrders.mockResolvedValue([mockOrder]);
      mockedOrderCache.cacheOrders.mockResolvedValue(undefined);
      const store = makeStore();
      await store.dispatch(fetchOrders());
      const state = store.getState().orders;
      expect(state.loading).toBe(false);
      expect(state.items).toHaveLength(1);
      expect(state.items[0]?.id).toBe(1);
      expect(state.isOffline).toBe(false);
    });

    it('should fall back to cache when API fails', async () => {
      mockedOrdersService.getOrders.mockRejectedValue(new Error('Server error'));
      mockedOrderCache.getCachedOrders.mockResolvedValue([mockOrder]);
      const store = makeStore();
      await store.dispatch(fetchOrders());
      const state = store.getState().orders;
      expect(state.items).toHaveLength(1);
      expect(state.isOffline).toBe(true);
    });

    it('should set error when API fails and no cache', async () => {
      mockedOrdersService.getOrders.mockRejectedValue(new Error('Server error'));
      mockedOrderCache.getCachedOrders.mockResolvedValue([]);
      const store = makeStore();
      await store.dispatch(fetchOrders());
      const state = store.getState().orders;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to load orders');
    });
  });
});

import {configureStore} from '@reduxjs/toolkit';
import ordersReducer, {fetchOrders} from './ordersSlice';
import {ordersService} from '../services/ordersService';
import type {Order} from '../types/order.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../services/ordersService');
const mockedOrdersService = ordersService as jest.Mocked<typeof ordersService>;

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
    expect(store.getState().orders).toEqual({items: [], loading: false, error: null});
  });

  describe('fetchOrders thunk', () => {
    beforeEach(() => {
      mockedOrdersService.getOrders.mockReset();
    });

    it('should set loading=true and clear error on pending', () => {
      const store = makeStore();
      store.dispatch({type: fetchOrders.pending.type});
      const state = store.getState().orders;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should populate items and set loading=false on fulfilled', async () => {
      mockedOrdersService.getOrders.mockResolvedValue([mockOrder]);
      const store = makeStore();
      await store.dispatch(fetchOrders());
      const state = store.getState().orders;
      expect(state.loading).toBe(false);
      expect(state.items).toHaveLength(1);
      expect(state.items[0]?.id).toBe(1);
      expect(state.error).toBeNull();
    });

    it('should set error and loading=false on rejected', async () => {
      mockedOrdersService.getOrders.mockRejectedValue(new Error('Server error'));
      const store = makeStore();
      await store.dispatch(fetchOrders());
      const state = store.getState().orders;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Server error');
      expect(state.items).toHaveLength(0);
    });

    it('should use fallback error message when error has no message', async () => {
      mockedOrdersService.getOrders.mockRejectedValue({});
      const store = makeStore();
      await store.dispatch(fetchOrders());
      expect(store.getState().orders.error).toBe('Failed to load orders');
    });
  });
});

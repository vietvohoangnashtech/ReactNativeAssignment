import React from 'react';
import {renderHook, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {useOrders} from './useOrders';
import {ordersService} from '../services/ordersService';
import rootReducer from '../../../store/rootReducer';
import type {Order} from '../types/order.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../../services/database/repositories/cartRepository', () => ({
  cartRepository: {
    loadCart: jest.fn().mockResolvedValue([]),
    saveCart: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../services/database/repositories/profileRepository', () => ({
  profileRepository: {
    getProfile: jest.fn().mockResolvedValue(null),
    saveProfile: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../services/ordersService');
const mockedOrdersService = ordersService as jest.Mocked<typeof ordersService>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockOrders: Order[] = [
  {
    id: 1,
    userId: 5,
    items: [{productId: 2, quantity: 2, price: 19.99}],
    totalAmount: 39.98,
    shippingAddress: '123 Main St',
    paymentMethod: 'credit_card',
    status: 'completed',
    createdAt: '2024-01-10T12:00:00.000Z',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeWrapper() {
  const testStore = configureStore({reducer: rootReducer});
  const Wrapper = ({children}: {children: React.ReactNode}) => (
    <Provider store={testStore}>{children}</Provider>
  );
  return Wrapper;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useOrders hook', () => {
  beforeEach(() => {
    mockedOrdersService.getOrders.mockReset();
  });

  it('should start with empty orders and loading=true', () => {
    mockedOrdersService.getOrders.mockResolvedValue([]);
    const {result} = renderHook(() => useOrders(), {wrapper: makeWrapper()});
    expect(result.current.orders).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should populate orders after a successful fetch', async () => {
    mockedOrdersService.getOrders.mockResolvedValue(mockOrders);
    const {result} = renderHook(() => useOrders(), {wrapper: makeWrapper()});

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.orders).toEqual(mockOrders);
    expect(result.current.error).toBeNull();
  });

  it('should set error when service throws', async () => {
    mockedOrdersService.getOrders.mockRejectedValue(new Error('Unauthorized'));
    const {result} = renderHook(() => useOrders(), {wrapper: makeWrapper()});

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.orders).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should expose a refetch function', async () => {
    mockedOrdersService.getOrders.mockResolvedValue([]);
    const {result} = renderHook(() => useOrders(), {wrapper: makeWrapper()});

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(typeof result.current.refetch).toBe('function');
  });
});

import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {OrderHistoryScreen} from './OrderHistoryScreen';
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

jest.mock('../../../services/database/repositories/orderCacheRepository', () => ({
  orderCacheRepository: {
    cacheOrders: jest.fn().mockResolvedValue(undefined),
    getCachedOrders: jest.fn().mockResolvedValue([]),
    createPendingOrder: jest.fn(),
    clearAll: jest.fn(),
  },
}));

jest.mock('../../../services/database/repositories/productCacheRepository', () => ({
  productCacheRepository: {
    getCachedProducts: jest.fn().mockResolvedValue({products: [], isStale: false}),
    cacheProducts: jest.fn().mockResolvedValue(undefined),
    getCachedCategories: jest.fn().mockResolvedValue([]),
    cacheCategories: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../services/database/repositories/syncQueueRepository', () => ({
  syncQueueRepository: {
    enqueue: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../services/ordersService');
const mockOrdersService = ordersService as jest.Mocked<typeof ordersService>;

jest.mock('react-native-vector-icons/Feather', () => 'Feather');

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const pendingOrder: Order = {
  id: 1,
  userId: 10,
  items: [{productId: 2, quantity: 1, price: 99.99}],
  totalAmount: 99.99,
  shippingAddress: '123 Main St',
  paymentMethod: 'credit_card',
  status: 'pending',
  createdAt: '2024-03-01T10:00:00.000Z',
};

const deliveredOrder: Order = {
  id: 2,
  userId: 10,
  items: [{productId: 3, quantity: 2, price: 49.99}],
  totalAmount: 99.98,
  shippingAddress: '456 Oak Ave',
  paymentMethod: 'paypal',
  status: 'delivered',
  createdAt: '2024-02-15T15:30:00.000Z',
};

const cancelledOrder: Order = {
  id: 3,
  userId: 10,
  items: [{productId: 5, quantity: 1, price: 199.99}],
  totalAmount: 199.99,
  paymentMethod: 'cash_on_delivery',
  status: 'cancelled',
  createdAt: '2024-01-20T08:00:00.000Z',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderOrderHistory() {
  const store = configureStore({reducer: rootReducer});
  return render(
    <Provider store={store}>
      <OrderHistoryScreen />
    </Provider>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('OrderHistoryScreen', () => {
  beforeEach(() => {
    mockOrdersService.getOrders.mockReset();
  });

  it('should render the "Order History" header', () => {
    mockOrdersService.getOrders.mockResolvedValue([]);
    const {getByText} = renderOrderHistory();
    expect(getByText('Order History')).toBeTruthy();
  });

  it('should render all four filter tabs', () => {
    mockOrdersService.getOrders.mockResolvedValue([]);
    const {getByText} = renderOrderHistory();
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Ongoing')).toBeTruthy();
    expect(getByText('Completed')).toBeTruthy();
    expect(getByText('Cancelled')).toBeTruthy();
  });

  it('should render order IDs after loading', async () => {
    mockOrdersService.getOrders.mockResolvedValue([pendingOrder, deliveredOrder]);
    const {getByText} = renderOrderHistory();

    await waitFor(() => {
      expect(getByText('ORDER #ORD-00001')).toBeTruthy();
      expect(getByText('ORDER #ORD-00002')).toBeTruthy();
    });
  });

  it('should render status badges for orders', async () => {
    mockOrdersService.getOrders.mockResolvedValue([pendingOrder]);
    const {getByText} = renderOrderHistory();

    await waitFor(() => {
      expect(getByText('PENDING')).toBeTruthy();
    });
  });

  it('should render order total amounts', async () => {
    mockOrdersService.getOrders.mockResolvedValue([pendingOrder]);
    const {getByText} = renderOrderHistory();

    await waitFor(() => {
      expect(getByText('$99.99')).toBeTruthy();
    });
  });

  it('should render shipping address when provided', async () => {
    mockOrdersService.getOrders.mockResolvedValue([pendingOrder]);
    const {getByText} = renderOrderHistory();

    await waitFor(() => {
      expect(getByText('123 Main St')).toBeTruthy();
    });
  });

  it('should filter to show only ongoing orders when "Ongoing" tab is pressed', async () => {
    mockOrdersService.getOrders.mockResolvedValue([
      pendingOrder,
      deliveredOrder,
      cancelledOrder,
    ]);
    const {getByText, queryByText} = renderOrderHistory();

    await waitFor(() => getByText('ORDER #ORD-00001'));

    fireEvent.press(getByText('Ongoing'));

    // pending is "Ongoing", delivered and cancelled should be hidden
    await waitFor(() => {
      expect(getByText('ORDER #ORD-00001')).toBeTruthy();
      expect(queryByText('ORDER #ORD-00002')).toBeNull();
      expect(queryByText('ORDER #ORD-00003')).toBeNull();
    });
  });

  it('should filter to show only completed orders when "Completed" tab is pressed', async () => {
    mockOrdersService.getOrders.mockResolvedValue([pendingOrder, deliveredOrder]);
    const {getByText, queryByText} = renderOrderHistory();

    await waitFor(() => getByText('ORDER #ORD-00001'));

    fireEvent.press(getByText('Completed'));

    await waitFor(() => {
      expect(getByText('ORDER #ORD-00002')).toBeTruthy();
      expect(queryByText('ORDER #ORD-00001')).toBeNull();
    });
  });

  it('should filter to show only cancelled orders when "Cancelled" tab is pressed', async () => {
    mockOrdersService.getOrders.mockResolvedValue([pendingOrder, cancelledOrder]);
    const {getByText, queryByText} = renderOrderHistory();

    await waitFor(() => getByText('ORDER #ORD-00001'));

    fireEvent.press(getByText('Cancelled'));

    await waitFor(() => {
      expect(getByText('ORDER #ORD-00003')).toBeTruthy();
      expect(queryByText('ORDER #ORD-00001')).toBeNull();
    });
  });
});

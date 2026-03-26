import apiClient from '../../../services/api/client';
import {ordersService} from './ordersService';
import type {Order} from '../types/order.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../../services/api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockOrder: Order = {
  id: 1,
  userId: 10,
  items: [{productId: 2, quantity: 1, price: 29.99}],
  totalAmount: 29.99,
  shippingAddress: '123 Main St',
  paymentMethod: 'credit_card',
  status: 'pending',
  createdAt: '2024-01-01T00:00:00.000Z',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ordersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should return orders from API', async () => {
      mockedApiClient.get.mockResolvedValue({data: {data: [mockOrder]}});

      const result = await ordersService.getOrders();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/order');
      expect(result).toEqual([mockOrder]);
    });

    it('should propagate API errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network failure'));
      await expect(ordersService.getOrders()).rejects.toThrow('Network failure');
    });
  });

  describe('getPaymentMethods', () => {
    it('should return payment methods from API', async () => {
      const methods = ['credit_card', 'paypal', 'cash_on_delivery'];
      mockedApiClient.get.mockResolvedValue({data: {data: methods}});

      const result = await ordersService.getPaymentMethods();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/order/payment-methods');
      expect(result).toEqual(methods);
    });

    it('should propagate API errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Unauthorized'));
      await expect(ordersService.getPaymentMethods()).rejects.toThrow('Unauthorized');
    });
  });

  describe('createOrder', () => {
    const payload = {
      items: [{productId: 2, quantity: 1, price: 29.99}],
      totalAmount: 29.99,
      shippingAddress: '123 Main St',
      paymentMethod: 'credit_card',
    };

    it('should post to /order and return created order', async () => {
      mockedApiClient.post.mockResolvedValue({data: {data: mockOrder}});

      const result = await ordersService.createOrder(payload);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/order', payload);
      expect(result).toEqual(mockOrder);
    });

    it('should propagate API errors', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Bad Request'));
      await expect(ordersService.createOrder(payload)).rejects.toThrow('Bad Request');
    });
  });
});

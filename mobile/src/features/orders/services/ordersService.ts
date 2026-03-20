import apiClient from '../../../services/api/client';
import type {ApiResponse} from '../../../types/api/response.types';
import type {Order} from '../types/order.types';

const ordersService = {
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/order');
    return response.data.data;
  },

  getPaymentMethods: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>(
      '/order/payment-methods',
    );
    return response.data.data;
  },

  createOrder: async (payload: {
    items: {productId: number; quantity: number; price: number}[];
    totalAmount: number;
    shippingAddress: string;
    paymentMethod: string;
  }): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/order', payload);
    return response.data.data;
  },
};

export {ordersService};

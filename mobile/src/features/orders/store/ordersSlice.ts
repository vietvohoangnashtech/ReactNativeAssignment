import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {ordersService} from '../services/ordersService';
import {orderCacheRepository} from '../../../services/database/repositories/orderCacheRepository';
import type {Order} from '../types/order.types';

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
  isOffline: false,
};

export const fetchOrders = createAsyncThunk('orders/fetchAll', async () => {
  try {
    const orders = await ordersService.getOrders();
    await orderCacheRepository.cacheOrders(orders);
    return {orders, isOffline: false};
  } catch {
    const cached = await orderCacheRepository.getCachedOrders();
    if (cached.length > 0) {
      return {orders: cached, isOffline: true};
    }
    throw new Error('Failed to load orders');
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, state => {
        state.loading = state.items.length === 0;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, {payload}) => {
        state.loading = false;
        state.items = payload.orders;
        state.isOffline = payload.isOffline;
      })
      .addCase(fetchOrders.rejected, (state, {error}) => {
        state.loading = false;
        state.error = error.message ?? 'Failed to load orders';
      });
  },
});

export default ordersSlice.reducer;

import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {ordersService} from '../services/ordersService';
import type {Order} from '../types/order.types';

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk('orders/fetchAll', async () => {
  return ordersService.getOrders();
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, {payload}) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchOrders.rejected, (state, {error}) => {
        state.loading = false;
        state.error = error.message ?? 'Failed to load orders';
      });
  },
});

export default ordersSlice.reducer;

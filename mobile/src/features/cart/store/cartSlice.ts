import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {cartRepository} from '../../../services/database/repositories/cartRepository';
import type {CartItem} from '../types/cart.types';

interface CartState {
  items: CartItem[];
  hydrated: boolean;
}

const initialState: CartState = {items: [], hydrated: false};

export const loadCartFromDB = createAsyncThunk('cart/loadFromDB', async () => {
  return cartRepository.loadCart();
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: {payload: Omit<CartItem, 'quantity'>}) {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({...action.payload, quantity: 1});
      }
    },
    removeItem(state, action: {payload: number}) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    updateQuantity(
      state,
      action: {payload: {id: number; quantity: number}},
    ) {
      const {id, quantity} = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter(i => i.id !== id);
      } else {
        const item = state.items.find(i => i.id === id);
        if (item) {
          item.quantity = quantity;
        }
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
  extraReducers: builder => {
    builder.addCase(loadCartFromDB.fulfilled, (state, {payload}) => {
      state.items = payload;
      state.hydrated = true;
    });
  },
});

export const {addItem, removeItem, updateQuantity, clearCart} = cartSlice.actions;

export const selectCartItems = (state: {cart: CartState}) => state.cart.items;
export const selectCartTotal = (state: {cart: CartState}) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCartItemCount = (state: {cart: CartState}) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartHydrated = (state: {cart: CartState}) =>
  state.cart.hydrated;

export default cartSlice.reducer;

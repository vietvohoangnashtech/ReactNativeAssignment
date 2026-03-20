import {createSlice} from '@reduxjs/toolkit';
import type {CartItem} from '../types/cart.types';

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {items: []};

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
});

export const {addItem, removeItem, updateQuantity, clearCart} = cartSlice.actions;

export const selectCartItems = (state: {cart: CartState}) => state.cart.items;
export const selectCartTotal = (state: {cart: CartState}) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCartItemCount = (state: {cart: CartState}) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export default cartSlice.reducer;

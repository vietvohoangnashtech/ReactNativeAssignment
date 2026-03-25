import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import rootReducer from './rootReducer';
import {cartRepository} from '../services/database/repositories/cartRepository';

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);

// Cart persistence: debounced sync of Redux cart state → WatermelonDB on every change
let cartSyncTimer: ReturnType<typeof setTimeout> | null = null;
let previousCartItems = store.getState().cart.items;

store.subscribe(() => {
  const currentItems = store.getState().cart.items;
  if (currentItems !== previousCartItems) {
    previousCartItems = currentItems;
    if (cartSyncTimer !== null) {
      clearTimeout(cartSyncTimer);
    }
    cartSyncTimer = setTimeout(() => {
      cartRepository.saveCart(currentItems).catch((err: unknown) => {
        if (err instanceof Error) {
          console.error('[CartRepository] Failed to persist cart:', err.message);
        }
      });
    }, 300);
  }
});

import { combineReducers } from '@reduxjs/toolkit';
import productsReducer from '../features/products/store/productsSlice';
import cartReducer from '../features/cart/store/cartSlice';
import ordersReducer from '../features/orders/store/ordersSlice';
import profileReducer from '../features/profile/store/profileSlice';
import authReducer from '../features/auth/store/authSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  cart: cartReducer,
  orders: ordersReducer,
  profile: profileReducer,
});

export default rootReducer;

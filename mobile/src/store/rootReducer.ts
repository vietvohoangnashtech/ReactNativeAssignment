import { combineReducers } from '@reduxjs/toolkit';
import productsReducer from '../features/products/store/productsSlice';
import cartReducer from '../features/cart/store/cartSlice';
import ordersReducer from '../features/orders/store/ordersSlice';
import profileReducer from '../features/profile/store/profileSlice';
import authReducer from '../features/auth/store/authSlice';
import wishlistReducer from '../features/wishlist/store/wishlistSlice';
import networkReducer from './networkSlice';
import syncReducer from './syncSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  cart: cartReducer,
  orders: ordersReducer,
  profile: profileReducer,
  wishlist: wishlistReducer,
  network: networkReducer,
  sync: syncReducer,
});

export default rootReducer;

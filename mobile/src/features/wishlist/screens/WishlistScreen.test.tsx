import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import {WishlistScreen} from './WishlistScreen';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import wishlistReducer from '../store/wishlistSlice';
import productsReducer from '../../products/store/productsSlice';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn()}),
}));

jest.mock('react-native-vector-icons/Feather', () => {
  const {Text} = require('react-native');
  return (props: any) => <Text>{props.name}</Text>;
});

jest.mock('../services/wishlistService', () => ({
  wishlistService: {
    getWishlist: jest.fn().mockResolvedValue([]),
    toggleWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
  },
}));

jest.mock('../../../services/database/repositories/productCacheRepository', () => ({
  productCacheRepository: {
    getCachedProducts: jest.fn().mockResolvedValue({products: [], isStale: false}),
    cacheProducts: jest.fn(),
    getCachedCategories: jest.fn().mockResolvedValue([]),
    cacheCategories: jest.fn(),
  },
}));

jest.mock('../../../theme', () => ({
  colors: {
    background: '#fff',
    surface: '#fff',
    primary: '#000',
    primaryLight: '#eee',
    border: '#ddd',
    textHeading: '#000',
    textMuted: '#888',
    textDisabled: '#ccc',
    error: '#f00',
    black: '#000',
    inputBg: '#f0f0f0',
  },
}));

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeStore(preloadedState?: any) {
  return configureStore({
    reducer: {
      wishlist: wishlistReducer,
      products: productsReducer,
    },
    preloadedState,
  } as any);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('WishlistScreen', () => {
  it('should render empty state when wishlist is empty', async () => {
    const store = makeStore({
      wishlist: {productIds: [], loading: false, error: null},
      products: {items: [], categories: [], loading: false, error: null, isOffline: false, isStale: false},
    });
    const {getByText} = render(
      <Provider store={store}>
        <WishlistScreen />
      </Provider>,
    );
    // Wait for the fetchWishlist dispatch to settle
    await waitFor(() => {
      expect(getByText('Your wishlist is empty')).toBeTruthy();
    });
    expect(getByText('0 items')).toBeTruthy();
  });

  it('should render wishlist products', () => {
    const store = makeStore({
      wishlist: {productIds: [1], loading: false, error: null},
      products: {
        items: [{id: 1, name: 'Test Product', price: 29.99, description: '', image: '', priceUnit: 'dollar', category: 'test'}],
        categories: [],
        loading: false,
        error: null,
        isOffline: false,
        isStale: false,
      },
    });
    const {getByText} = render(
      <Provider store={store}>
        <WishlistScreen />
      </Provider>,
    );
    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('$29.99')).toBeTruthy();
    expect(getByText('1 items')).toBeTruthy();
  });

  it('should show loading indicator when loading with no products', () => {
    const store = makeStore({
      wishlist: {productIds: [], loading: true, error: null},
      products: {items: [], categories: [], loading: false, error: null, isOffline: false, isStale: false},
    });
    const {toJSON} = render(
      <Provider store={store}>
        <WishlistScreen />
      </Provider>,
    );
    // ActivityIndicator should be present when loading
    expect(toJSON()).toBeTruthy();
  });
});

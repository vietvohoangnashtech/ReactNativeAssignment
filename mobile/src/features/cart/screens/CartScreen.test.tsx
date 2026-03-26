import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {CartScreen} from './CartScreen';
import {addItem} from '../store/cartSlice';
import rootReducer from '../../../store/rootReducer';
import type {CartItem} from '../types/cart.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../../services/database/repositories/cartRepository', () => ({
  cartRepository: {
    loadCart: jest.fn().mockResolvedValue([]),
    saveCart: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../services/database/repositories/profileRepository', () => ({
  profileRepository: {
    getProfile: jest.fn().mockResolvedValue(null),
    saveProfile: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('react-native-vector-icons/Feather', () => 'Feather');

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate, goBack: jest.fn()}),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCartItem: Omit<CartItem, 'quantity'> = {
  id: 1,
  name: 'Wireless Laptop',
  price: 999.99,
  image: 'https://example.com/laptop.jpg',
};

const secondItem: Omit<CartItem, 'quantity'> = {
  id: 2,
  name: 'Mechanical Keyboard',
  price: 149.99,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeStore(preloadItems: typeof mockCartItem[] = []) {
  const store = configureStore({reducer: rootReducer});
  preloadItems.forEach(item => store.dispatch(addItem(item)));
  return store;
}

function renderCart(store = makeStore()) {
  return render(
    <Provider store={store}>
      <CartScreen />
    </Provider>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CartScreen', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  describe('empty cart', () => {
    it('should display the empty cart message', () => {
      const {getByText} = renderCart();
      expect(getByText('Your cart is empty')).toBeTruthy();
      expect(getByText('Add items to get started')).toBeTruthy();
    });

    it('should show "My Cart" with no count when empty', () => {
      const {getByText} = renderCart();
      expect(getByText('My Cart')).toBeTruthy();
    });
  });

  describe('cart with items', () => {
    it('should render item name and price', () => {
      const {getByText, getAllByText} = renderCart(makeStore([mockCartItem]));
      expect(getByText('Wireless Laptop')).toBeTruthy();
      // Price appears in both the item card and the summary row
      expect(getAllByText('$999.99').length).toBeGreaterThanOrEqual(1);
    });

    it('should show the item count in the header', () => {
      const {getByText} = renderCart(makeStore([mockCartItem]));
      expect(getByText('My Cart (1)')).toBeTruthy();
    });

    it('should show the "Proceed to Checkout" button', () => {
      const {getByText} = renderCart(makeStore([mockCartItem]));
      expect(getByText('Proceed to Checkout')).toBeTruthy();
    });

    it('should show the "Clear" button when items exist', () => {
      const {getByText} = renderCart(makeStore([mockCartItem]));
      expect(getByText('Clear')).toBeTruthy();
    });

    it('should display the correct total', () => {
      const {getAllByText} = renderCart(makeStore([mockCartItem]));
      // Total appears in both Subtotal and Total rows
      expect(getAllByText('$999.99').length).toBeGreaterThanOrEqual(1);
    });

    it('should navigate to Checkout when the checkout button is pressed', () => {
      const {getByText} = renderCart(makeStore([mockCartItem]));
      fireEvent.press(getByText('Proceed to Checkout'));
      expect(mockNavigate).toHaveBeenCalledWith('Checkout');
    });

    it('should clear all items when Clear is pressed', () => {
      const {getByText, queryByText} = renderCart(makeStore([mockCartItem]));
      fireEvent.press(getByText('Clear'));
      expect(queryByText('Wireless Laptop')).toBeNull();
      expect(getByText('Your cart is empty')).toBeTruthy();
    });

    it('should show the total for multiple items', () => {
      const {getByText, getAllByText} = renderCart(makeStore([mockCartItem, secondItem]));
      expect(getByText('My Cart (2)')).toBeTruthy();
      // Total = 999.99 + 149.99 = 1149.98, appears in both Subtotal and Total rows
      expect(getAllByText('$1149.98').length).toBeGreaterThanOrEqual(1);
    });
  });
});

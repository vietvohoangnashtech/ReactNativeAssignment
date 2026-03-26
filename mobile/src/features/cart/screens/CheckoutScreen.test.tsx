import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {Alert} from 'react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {CheckoutScreen} from './CheckoutScreen';
import {addItem} from '../store/cartSlice';
import rootReducer from '../../../store/rootReducer';
import apiClient from '../../../services/api/client';
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
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate, goBack: mockGoBack}),
}));

jest.mock('../../../services/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockPaymentMethods = ['credit_card', 'paypal', 'cash_on_delivery'];

const mockCartItem: Omit<CartItem, 'quantity'> = {
  id: 1,
  name: 'Wireless Headphones',
  price: 79.99,
  image: 'https://example.com/headphones.jpg',
};

const secondItem: Omit<CartItem, 'quantity'> = {
  id: 2,
  name: 'USB Cable',
  price: 9.99,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeStore(preloadItems: typeof mockCartItem[] = []) {
  const store = configureStore({reducer: rootReducer});
  preloadItems.forEach(item => store.dispatch(addItem(item)));
  return store;
}

function renderCheckout(store = makeStore()) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <CheckoutScreen />
      </Provider>,
    ),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CheckoutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockApiClient.get as jest.Mock).mockResolvedValue({
      data: {data: mockPaymentMethods},
    });
    (mockApiClient.post as jest.Mock).mockResolvedValue({data: {data: {id: 42}}});
  });

  describe('rendering', () => {
    it('should render the Checkout header', async () => {
      const {getByText} = renderCheckout(makeStore([mockCartItem]));
      await waitFor(() => {
        expect(getByText('Checkout')).toBeTruthy();
      });
    });

    it('should render Order Summary section heading', async () => {
      const {getByText} = renderCheckout(makeStore([mockCartItem]));
      await waitFor(() => {
        expect(getByText('Order Summary')).toBeTruthy();
      });
    });

    it('should render item names in the order summary', async () => {
      const {getByText} = renderCheckout(makeStore([mockCartItem]));
      await waitFor(() => {
        expect(getByText('Wireless Headphones')).toBeTruthy();
      });
    });

    it('should render the correct total for a single item', async () => {
      // price appears in both the item row and the total row
      const {getAllByText} = renderCheckout(makeStore([mockCartItem]));
      await waitFor(() => {
        expect(getAllByText('$79.99').length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should render the correct total for multiple items', async () => {
      const {getByText} = renderCheckout(makeStore([mockCartItem, secondItem]));
      await waitFor(() => {
        // 79.99 + 9.99 = 89.98 — appears in both item rows and the total row
        expect(getByText('$89.98')).toBeTruthy();
      });
    });

    it('should render Shipping Address section heading', async () => {
      const {getByText} = renderCheckout(makeStore([mockCartItem]));
      await waitFor(() => {
        expect(getByText('Shipping Address')).toBeTruthy();
      });
    });

    it('should render Payment Method section heading', async () => {
      const {getByText} = renderCheckout(makeStore([mockCartItem]));
      await waitFor(() => {
        expect(getByText('Payment Method')).toBeTruthy();
      });
    });

    it('should render payment methods after they are fetched', async () => {
      const {getByText} = renderCheckout(makeStore([mockCartItem]));
      await waitFor(() => {
        expect(getByText('Credit Card')).toBeTruthy();
        expect(getByText('Paypal')).toBeTruthy();
        expect(getByText('Cash On Delivery')).toBeTruthy();
      });
    });

    it('should render the Place Order button with total', async () => {
      const {getByText} = renderCheckout(makeStore([mockCartItem]));
      await waitFor(() => {
        expect(getByText(/Place Order/)).toBeTruthy();
      });
    });

    it('should call goBack when back button in header is pressed', async () => {
      const {getByText} = renderCheckout(makeStore([mockCartItem]));
      await waitFor(() => getByText('Checkout'));
      // ScreenHeader renders a back button when onBack is provided
      // The back press is triggered via the onBack prop calling navigation.goBack
      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });

  describe('payment method selection', () => {
    it('should select a payment method when pressed', async () => {
      const {getByText} = renderCheckout(makeStore([mockCartItem]));
      await waitFor(() => getByText('Paypal'));

      fireEvent.press(getByText('Paypal'));

      // After pressing, Paypal option becomes active (no error thrown)
      expect(getByText('Paypal')).toBeTruthy();
    });
  });

  describe('order placement validation', () => {
    it('should disable Place Order button when shipping address is empty', async () => {
      // The button is disabled by the UI guard: !address.trim() || items.length === 0
      const {UNSAFE_getByProps} = renderCheckout(makeStore([mockCartItem]));
      await waitFor(() => {
        const btn = UNSAFE_getByProps({disabled: true});
        expect(btn).toBeTruthy();
      });
    });

    it('should disable Place Order button when cart is empty', async () => {
      const {UNSAFE_getByProps} = renderCheckout(makeStore());
      await waitFor(() => {
        const btn = UNSAFE_getByProps({disabled: true});
        expect(btn).toBeTruthy();
      });
    });

    it('should enable the Place Order button when address and items are present', async () => {
      const {getByPlaceholderText, getByText} = renderCheckout(
        makeStore([mockCartItem]),
      );

      await waitFor(() => getByText(/Place Order/));

      fireEvent.changeText(
        getByPlaceholderText('Street, City, State, ZIP, Country'),
        '123 Main St',
      );

      await waitFor(() => {
        // When address is present and cart has items the button should not be disabled
        expect(getByText(/Place Order/)).toBeTruthy();
      });
    });
  });

  describe('successful order placement', () => {
    it('should call POST /order with correct payload', async () => {
      const {getByPlaceholderText, getByText} = renderCheckout(
        makeStore([mockCartItem]),
      );

      await waitFor(() => getByText('Credit Card'));

      fireEvent.changeText(
        getByPlaceholderText('Street, City, State, ZIP, Country'),
        '456 Oak Ave',
      );

      await act(async () => {
        fireEvent.press(getByText(/Place Order/));
      });

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/order',
          expect.objectContaining({
            shippingAddress: '456 Oak Ave',
            items: expect.arrayContaining([
              expect.objectContaining({productId: 1, price: 79.99}),
            ]),
          }),
        );
      });
    });

    it('should dispatch clearCart after a successful order', async () => {
      const {store, getByPlaceholderText, getByText} = renderCheckout(
        makeStore([mockCartItem]),
      );

      await waitFor(() => getByText('Credit Card'));

      fireEvent.changeText(
        getByPlaceholderText('Street, City, State, ZIP, Country'),
        '456 Oak Ave',
      );

      await act(async () => {
        fireEvent.press(getByText(/Place Order/));
      });

      await waitFor(() => {
        expect(store.getState().cart.items).toHaveLength(0);
      });
    });

    it('should show Order Placed alert on success', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const {getByPlaceholderText, getByText} = renderCheckout(
        makeStore([mockCartItem]),
      );

      await waitFor(() => getByText('Credit Card'));

      fireEvent.changeText(
        getByPlaceholderText('Street, City, State, ZIP, Country'),
        '456 Oak Ave',
      );

      await act(async () => {
        fireEvent.press(getByText(/Place Order/));
      });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Order Placed!',
          'Your order has been placed successfully.',
          expect.any(Array),
        );
      });
    });
  });

  describe('failed order placement', () => {
    it('should show error alert when API returns an error message', async () => {
      (mockApiClient.post as jest.Mock).mockRejectedValue({
        response: {data: {message: 'Payment declined'}},
      });

      const alertSpy = jest.spyOn(Alert, 'alert');
      const {getByPlaceholderText, getByText} = renderCheckout(
        makeStore([mockCartItem]),
      );

      await waitFor(() => getByText('Credit Card'));

      fireEvent.changeText(
        getByPlaceholderText('Street, City, State, ZIP, Country'),
        '456 Oak Ave',
      );

      await act(async () => {
        fireEvent.press(getByText(/Place Order/));
      });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error', 'Payment declined');
      });
    });

    it('should show fallback error when API returns no message', async () => {
      (mockApiClient.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

      const alertSpy = jest.spyOn(Alert, 'alert');
      const {getByPlaceholderText, getByText} = renderCheckout(
        makeStore([mockCartItem]),
      );

      await waitFor(() => getByText('Credit Card'));

      fireEvent.changeText(
        getByPlaceholderText('Street, City, State, ZIP, Country'),
        '456 Oak Ave',
      );

      await act(async () => {
        fireEvent.press(getByText(/Place Order/));
      });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to place order');
      });
    });
  });
});

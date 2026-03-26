import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {ProductListScreen} from './ProductListScreen';
import {productService} from '../services/productService';
import {categoryService} from '../services/categoryService';
import rootReducer from '../../../store/rootReducer';
import type {Product} from '../types/product.types';
import type {Category} from '../types/category.types';

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

jest.mock('../services/productService');
jest.mock('../services/categoryService');

const mockProductService = productService as jest.Mocked<typeof productService>;
const mockCategoryService = categoryService as jest.Mocked<typeof categoryService>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const laptopProduct: Product = {
  id: 1,
  name: 'Gaming Laptop',
  description: 'High-performance laptop',
  image: 'https://example.com/laptop.jpg',
  price: 1299.99,
  priceUnit: 'dollar',
  category: 'electronics',
};

const keyboardProduct: Product = {
  id: 2,
  name: 'Mechanical Keyboard',
  description: 'Clicky mechanical keyboard',
  image: '',
  price: 149.99,
  priceUnit: 'dollar',
  category: 'accessories',
};

const mockCategories: Category[] = [
  {id: 1, name: 'electronics'},
  {id: 2, name: 'accessories'},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderProductList() {
  const store = configureStore({reducer: rootReducer});
  return {
    store,
    ...render(
      <Provider store={store}>
        <ProductListScreen />
      </Provider>,
    ),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReset();
    mockProductService.getProducts.mockResolvedValue([laptopProduct, keyboardProduct]);
    mockCategoryService.getCategories.mockResolvedValue(mockCategories);
  });

  describe('rendering', () => {
    it('should render the Discover heading', () => {
      const {getByText} = renderProductList();
      expect(getByText('Discover')).toBeTruthy();
    });

    it('should show a loading indicator before products are fetched', () => {
      mockProductService.getProducts.mockReturnValue(new Promise(() => {}));
      const {ActivityIndicator} = require('react-native');
      const {UNSAFE_getByType} = renderProductList();
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('should render product names after loading', async () => {
      const {getByText} = renderProductList();
      await waitFor(() => {
        expect(getByText('Gaming Laptop')).toBeTruthy();
        expect(getByText('Mechanical Keyboard')).toBeTruthy();
      });
    });

    it('should render product prices after loading', async () => {
      const {getByText} = renderProductList();
      await waitFor(() => {
        expect(getByText('$1299.99')).toBeTruthy();
        expect(getByText('$149.99')).toBeTruthy();
      });
    });

    it('should render the "All" category tab by default', async () => {
      const {getByText} = renderProductList();
      await waitFor(() => {
        expect(getByText('All')).toBeTruthy();
      });
    });

    it('should render category tabs from the service', async () => {
      const {getAllByText} = renderProductList();
      await waitFor(() => {
        // 'electronics' appears in both the category chip and the product card label
        expect(getAllByText('electronics').length).toBeGreaterThanOrEqual(1);
        expect(getAllByText('accessories').length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should render a search input', () => {
      const {getByPlaceholderText} = renderProductList();
      expect(getByPlaceholderText('Search products...')).toBeTruthy();
    });
  });

  describe('error state', () => {
    it('should show an error message when getProducts rejects', async () => {
      mockProductService.getProducts.mockRejectedValue(
        new Error('Network failure'),
      );
      const {getByText} = renderProductList();
      await waitFor(() => {
        expect(getByText('Network failure')).toBeTruthy();
      });
    });

    it('should show a Retry button when there is an error', async () => {
      mockProductService.getProducts.mockRejectedValue(new Error('Network failure'));
      const {getByText} = renderProductList();
      await waitFor(() => {
        expect(getByText('Retry')).toBeTruthy();
      });
    });

    it('should refetch products when Retry is pressed', async () => {
      mockProductService.getProducts
        .mockRejectedValueOnce(new Error('Network failure'))
        .mockResolvedValueOnce([laptopProduct]);

      const {getByText} = renderProductList();

      await waitFor(() => getByText('Retry'));
      await act(async () => {
        fireEvent.press(getByText('Retry'));
      });

      await waitFor(() => {
        expect(mockProductService.getProducts).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('search functionality', () => {
    it('should filter products by search term', async () => {
      const {getByPlaceholderText, getByText, queryByText} = renderProductList();

      await waitFor(() => getByText('Gaming Laptop'));

      fireEvent.changeText(getByPlaceholderText('Search products...'), 'laptop');

      await waitFor(() => {
        expect(getByText('Gaming Laptop')).toBeTruthy();
        expect(queryByText('Mechanical Keyboard')).toBeNull();
      });
    });

    it('should restore full list when search is cleared', async () => {
      const {getByPlaceholderText, getByText} = renderProductList();

      await waitFor(() => getByText('Gaming Laptop'));

      fireEvent.changeText(getByPlaceholderText('Search products...'), 'laptop');
      fireEvent.changeText(getByPlaceholderText('Search products...'), '');

      await waitFor(() => {
        expect(getByText('Gaming Laptop')).toBeTruthy();
        expect(getByText('Mechanical Keyboard')).toBeTruthy();
      });
    });
  });

  describe('category filtering', () => {
    it('should filter products when a category tab is pressed', async () => {
      // 'electronics' appears in both the tab chip and the product card category label.
      // getAllByText returns [chipElement, cardLabel]; the chip is first in render order.
      const {getAllByText, queryByText} = renderProductList();

      await waitFor(() => getAllByText('electronics'));

      // Press the first occurrence — the category tab chip
      fireEvent.press(getAllByText('electronics')[0]);

      await waitFor(() => {
        expect(getAllByText('Gaming Laptop').length).toBeGreaterThanOrEqual(1);
        expect(queryByText('Mechanical Keyboard')).toBeNull();
      });
    });

    it('should show all products when All tab is pressed', async () => {
      const {getAllByText, getByText} = renderProductList();

      await waitFor(() => getAllByText('electronics'));
      fireEvent.press(getAllByText('electronics')[0]);
      fireEvent.press(getByText('All'));

      await waitFor(() => {
        expect(getAllByText('Gaming Laptop').length).toBeGreaterThanOrEqual(1);
        expect(getAllByText('Mechanical Keyboard').length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('navigation', () => {
    it('should navigate to ProductDetail when a product card is pressed', async () => {
      const {getByText} = renderProductList();

      await waitFor(() => getByText('Gaming Laptop'));

      fireEvent.press(getByText('Gaming Laptop'));

      expect(mockNavigate).toHaveBeenCalledWith('ProductDetail', {productId: 1});
    });
  });

  describe('add to cart', () => {
    it('should add item to the Redux store when addItem is dispatched', async () => {
      // The add (+) button inside each product card contains only a Feather icon
      // and has no accessible text. Test via direct Redux dispatch to confirm
      // the cart slice integration works correctly with the screen's store.
      const {store} = renderProductList();

      await waitFor(() => expect(store.getState().products.items.length).toBe(2));

      const {addItem: addItemAction} = require('../../cart/store/cartSlice');
      store.dispatch(addItemAction({id: 1, name: 'Gaming Laptop', price: 1299.99}));

      expect(store.getState().cart.items).toHaveLength(1);
      expect(store.getState().cart.items[0]).toMatchObject({
        id: 1,
        name: 'Gaming Laptop',
        price: 1299.99,
        quantity: 1,
      });
    });
  });
});

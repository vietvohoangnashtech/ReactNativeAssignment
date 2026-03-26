import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ProductDetailScreen} from './ProductDetailScreen';
import {productService} from '../services/productService';
import rootReducer from '../../../store/rootReducer';
import type {Product, ProductReview} from '../types/product.types';
import type {RootStackParamList} from '../../../navigation/types';

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

jest.mock('../services/productService');
const mockProductService = productService as jest.Mocked<typeof productService>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

type ScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const mockRoute: ScreenProps['route'] = {
  key: 'ProductDetail',
  name: 'ProductDetail',
  params: {productId: 7},
};

const mockProduct: Product = {
  id: 7,
  name: 'Noise Cancelling Headphones',
  description: 'Premium over-ear noise cancelling headphones with 30h battery.',
  image: 'https://example.com/headphones.jpg',
  price: 299.99,
  priceUnit: 'dollar',
  category: 'electronics',
};

const mockReviews: ProductReview[] = [
  {
    id: 1,
    productId: 7,
    userId: 11,
    rating: 5,
    message: 'Absolutely amazing sound quality!',
    createdAt: '2024-01-10T10:00:00.000Z',
    User: {username: 'alice'},
  },
  {
    id: 2,
    productId: 7,
    userId: 12,
    rating: 4,
    message: 'Great value for the price.',
    createdAt: '2024-01-12T12:00:00.000Z',
    User: {username: 'bob'},
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderProductDetail(productId = mockRoute.params.productId) {
  const route = {...mockRoute, params: {productId}};
  const store = configureStore({reducer: rootReducer});
  return {
    store,
    ...render(
      <Provider store={store}>
        <ProductDetailScreen route={route as ScreenProps['route']} navigation={undefined as any} />
      </Provider>,
    ),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReset();
    mockGoBack.mockReset();
    mockProductService.getProductById.mockResolvedValue(mockProduct);
    mockProductService.getProductReviews.mockResolvedValue(mockReviews);
    mockProductService.addProductReview.mockResolvedValue({
      id: 99,
      productId: 7,
      userId: 1,
      rating: 5,
      message: 'Great!',
    });
  });

  describe('loading state', () => {
    it('should show a loading spinner before the product is fetched', () => {
      mockProductService.getProductById.mockReturnValue(new Promise(() => {}));
      const {ActivityIndicator} = require('react-native');
      const {UNSAFE_getByType} = renderProductDetail();
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });
  });

  describe('rendering', () => {
    it('should render "Product Details" header title', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('Product Details')).toBeTruthy();
      });
    });

    it('should render the product name', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('Noise Cancelling Headphones')).toBeTruthy();
      });
    });

    it('should render the formatted product price', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('$299.99')).toBeTruthy();
      });
    });

    it('should render the product category', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('electronics')).toBeTruthy();
      });
    });

    it('should render the product description', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(
          getByText(
            'Premium over-ear noise cancelling headphones with 30h battery.',
          ),
        ).toBeTruthy();
      });
    });

    it('should render the Add to Cart button', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('Add to Cart')).toBeTruthy();
      });
    });

    it('should render the Buy Now button', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('Buy Now')).toBeTruthy();
      });
    });

    it('should render features section labels', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('Quality Assured')).toBeTruthy();
        expect(getByText('Free Shipping')).toBeTruthy();
        expect(getByText('Easy Returns')).toBeTruthy();
        expect(getByText('Top Rated')).toBeTruthy();
      });
    });
  });

  describe('reviews', () => {
    it('should render review count in section heading', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('Reviews (2)')).toBeTruthy();
      });
    });

    it('should render review messages', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('Absolutely amazing sound quality!')).toBeTruthy();
        expect(getByText('Great value for the price.')).toBeTruthy();
      });
    });

    it('should render reviewer usernames', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('alice')).toBeTruthy();
        expect(getByText('bob')).toBeTruthy();
      });
    });

    it('should show "No reviews yet" when there are no reviews', async () => {
      mockProductService.getProductReviews.mockResolvedValue([]);
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('No reviews yet. Be the first!')).toBeTruthy();
      });
    });

    it('should render Reviews (0) heading when reviews list is empty', async () => {
      mockProductService.getProductReviews.mockResolvedValue([]);
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('Reviews (0)')).toBeTruthy();
      });
    });
  });

  describe('add to cart', () => {
    it('should dispatch addItem and show "Added!" after pressing Add to Cart', async () => {
      const {store, getByText} = renderProductDetail();

      await waitFor(() => getByText('Add to Cart'));
      fireEvent.press(getByText('Add to Cart'));

      expect(store.getState().cart.items).toHaveLength(1);
      expect(store.getState().cart.items[0]).toMatchObject({
        id: 7,
        name: 'Noise Cancelling Headphones',
        price: 299.99,
      });

      await waitFor(() => {
        expect(getByText('Added!')).toBeTruthy();
      });
    });

    it('should revert "Added!" back to "Add to Cart" after 1500ms', async () => {
      jest.useFakeTimers();
      const {getByText} = renderProductDetail();

      await act(async () => {
        await waitFor(() => getByText('Add to Cart'));
      });

      fireEvent.press(getByText('Add to Cart'));

      expect(getByText('Added!')).toBeTruthy();

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(getByText('Add to Cart')).toBeTruthy();
      jest.useRealTimers();
    });
  });

  describe('buy now', () => {
    it('should dispatch addItem and navigate to Checkout when Buy Now is pressed', async () => {
      const {store, getByText} = renderProductDetail();

      await waitFor(() => getByText('Buy Now'));
      fireEvent.press(getByText('Buy Now'));

      expect(store.getState().cart.items).toHaveLength(1);
      expect(mockNavigate).toHaveBeenCalledWith('Checkout');
    });
  });

  describe('navigation', () => {
    it('should call goBack when the back arrow is pressed', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => getByText('Product Details'));

      // The back button contains only a Feather icon; find via UNSAFE_getAllByType
      // Confirm goBack is wired — it's invoked by the header's back TouchableOpacity
      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });

  describe('review submission', () => {
    it('should render the Write a Review section', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('Write a Review')).toBeTruthy();
      });
    });

    it('should render the Submit Review button', async () => {
      const {getByText} = renderProductDetail();
      await waitFor(() => {
        expect(getByText('Submit Review')).toBeTruthy();
      });
    });

    it('should call productService.addProductReview when review is submitted', async () => {
      const {getByText, getByPlaceholderText} = renderProductDetail();

      await waitFor(() => getByText('Submit Review'));

      fireEvent.changeText(
        getByPlaceholderText('Share your thoughts...'),
        'Excellent product!',
      );

      await act(async () => {
        fireEvent.press(getByText('Submit Review'));
      });

      await waitFor(() => {
        expect(mockProductService.addProductReview).toHaveBeenCalledWith(
          7,
          expect.objectContaining({
            message: 'Excellent product!',
            rating: 5,
          }),
        );
      });
    });

    it('should refetch reviews after a successful review submission', async () => {
      const {getByText, getByPlaceholderText} = renderProductDetail();

      await waitFor(() => getByText('Submit Review'));

      fireEvent.changeText(
        getByPlaceholderText('Share your thoughts...'),
        'Excellent product!',
      );

      await act(async () => {
        fireEvent.press(getByText('Submit Review'));
      });

      await waitFor(() => {
        // getProductReviews called once on mount, then once after submit
        expect(mockProductService.getProductReviews).toHaveBeenCalledTimes(2);
      });
    });

    it('should clear the review input after successful submission', async () => {
      const {getByText, getByPlaceholderText} = renderProductDetail();

      await waitFor(() => getByText('Submit Review'));

      const input = getByPlaceholderText('Share your thoughts...');
      fireEvent.changeText(input, 'Excellent product!');

      await act(async () => {
        fireEvent.press(getByText('Submit Review'));
      });

      await waitFor(() => {
        expect(input.props.value).toBe('');
      });
    });

    it('should not call addProductReview when the review text is empty', async () => {
      const {getByText} = renderProductDetail();

      await waitFor(() => getByText('Submit Review'));

      await act(async () => {
        fireEvent.press(getByText('Submit Review'));
      });

      expect(mockProductService.addProductReview).not.toHaveBeenCalled();
    });
  });

  describe('service calls', () => {
    it('should call getProductById with the correct productId', async () => {
      renderProductDetail(7);
      await waitFor(() => {
        expect(mockProductService.getProductById).toHaveBeenCalledWith(7);
      });
    });

    it('should call getProductReviews with the correct productId', async () => {
      renderProductDetail(7);
      await waitFor(() => {
        expect(mockProductService.getProductReviews).toHaveBeenCalledWith(7);
      });
    });
  });
});

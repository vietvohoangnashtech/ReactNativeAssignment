import {productService} from './productService';
import apiClient from '../../../services/api/client';
import type {Product, ProductReview} from '../types/product.types';

// ─── Mock ────────────────────────────────────────────────────────────────────

jest.mock('../../../services/api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProduct: Product = {
  id: 1,
  name: 'Widget',
  description: 'A useful widget',
  image: 'https://example.com/widget.jpg',
  price: 29.99,
  priceUnit: 'dollar',
  category: 'Tools',
};

const mockReview: ProductReview = {
  id: 42,
  productId: 1,
  userId: 3,
  rating: 5,
  message: 'Excellent!',
  User: {username: 'alice'},
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('productService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return a list of products', async () => {
      mockedApiClient.get.mockResolvedValueOnce({data: {data: [mockProduct]}});
      const result = await productService.getProducts();
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(1);
    });

    it('should call GET /product', async () => {
      mockedApiClient.get.mockResolvedValueOnce({data: {data: []}});
      await productService.getProducts();
      expect(mockedApiClient.get).toHaveBeenCalledWith('/product');
    });

    it('should propagate errors from apiClient', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Network failure'));
      await expect(productService.getProducts()).rejects.toThrow('Network failure');
    });
  });

  describe('getProductById', () => {
    it('should return a single product by id', async () => {
      mockedApiClient.get.mockResolvedValueOnce({data: {data: mockProduct}});
      const result = await productService.getProductById(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Widget');
    });

    it('should call GET /product/:id with correct id', async () => {
      mockedApiClient.get.mockResolvedValueOnce({data: {data: mockProduct}});
      await productService.getProductById(1);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/product/1');
    });

    it('should propagate 404 errors', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Not Found'));
      await expect(productService.getProductById(999)).rejects.toThrow('Not Found');
    });
  });

  describe('getProductReviews', () => {
    it('should return reviews for a product', async () => {
      mockedApiClient.get.mockResolvedValueOnce({data: {data: [mockReview]}});
      const result = await productService.getProductReviews(1);
      expect(result).toHaveLength(1);
      expect(result[0]?.rating).toBe(5);
    });

    it('should call GET /product/:id/review', async () => {
      mockedApiClient.get.mockResolvedValueOnce({data: {data: []}});
      await productService.getProductReviews(1);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/product/1/review');
    });
  });

  describe('addProductReview', () => {
    it('should return the created review', async () => {
      mockedApiClient.post.mockResolvedValueOnce({data: {data: mockReview}});
      const result = await productService.addProductReview(1, {
        rating: 5,
        message: 'Excellent!',
      });
      expect(result.id).toBe(42);
      expect(result.rating).toBe(5);
    });

    it('should call POST /product/:id/review with correct payload', async () => {
      mockedApiClient.post.mockResolvedValueOnce({data: {data: mockReview}});
      await productService.addProductReview(1, {rating: 5, message: 'Excellent!'});
      expect(mockedApiClient.post).toHaveBeenCalledWith('/product/1/review', {
        rating: 5,
        message: 'Excellent!',
      });
    });

    it('should propagate errors from apiClient', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Unauthorized'));
      await expect(
        productService.addProductReview(1, {rating: 3, message: 'OK'}),
      ).rejects.toThrow('Unauthorized');
    });
  });
});

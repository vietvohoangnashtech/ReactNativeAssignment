import apiClient from '../../../services/api/client';
import type {ApiResponse} from '../../../types/api/response.types';
import type {Product, ProductReview, CreateReviewPayload} from '../types/product.types';

const productService = {
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/product');
    return response.data.data;
  },

  getProductById: async (productId: number): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/product/${productId}`);
    return response.data.data;
  },

  getProductReviews: async (productId: number): Promise<ProductReview[]> => {
    const response = await apiClient.get<ApiResponse<ProductReview[]>>(
      `/product/${productId}/review`,
    );
    return response.data.data;
  },

  addProductReview: async (
    productId: number,
    payload: CreateReviewPayload,
  ): Promise<ProductReview> => {
    const response = await apiClient.post<ApiResponse<ProductReview>>(
      `/product/${productId}/review`,
      payload,
    );
    return response.data.data;
  },
};

export {productService};

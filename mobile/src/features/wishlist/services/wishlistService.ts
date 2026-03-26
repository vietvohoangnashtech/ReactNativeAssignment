import apiClient from '../../../services/api/client';
import type {ApiResponse} from '../../../types/api/response.types';
import type {WishlistItem, ToggleWishlistResponse} from '../types/wishlist.types';

const wishlistService = {
  getWishlist: async (): Promise<WishlistItem[]> => {
    const response = await apiClient.get<ApiResponse<WishlistItem[]>>('/wishlist');
    return response.data.data;
  },

  toggleWishlist: async (productId: number): Promise<ToggleWishlistResponse> => {
    const response = await apiClient.post<ApiResponse<ToggleWishlistResponse>>('/wishlist', {productId});
    return response.data.data;
  },

  removeFromWishlist: async (productId: number): Promise<void> => {
    await apiClient.delete(`/wishlist/${productId}`);
  },
};

export {wishlistService};

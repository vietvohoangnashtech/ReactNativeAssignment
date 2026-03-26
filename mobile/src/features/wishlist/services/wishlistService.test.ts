import {wishlistService} from './wishlistService';
import apiClient from '../../../services/api/client';

// ─── Mock ────────────────────────────────────────────────────────────────────

jest.mock('../../../services/api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('wishlistService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWishlist', () => {
    it('should call GET /wishlist and return items', async () => {
      const items = [{id: 1, userId: 1, productId: 10, createdAt: '2025-01-01'}];
      mockedApiClient.get.mockResolvedValue({data: {data: items}});
      const result = await wishlistService.getWishlist();
      expect(mockedApiClient.get).toHaveBeenCalledWith('/wishlist');
      expect(result).toEqual(items);
    });

    it('should propagate errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network'));
      await expect(wishlistService.getWishlist()).rejects.toThrow('Network');
    });
  });

  describe('toggleWishlist', () => {
    it('should call POST /wishlist with productId', async () => {
      const response = {wishlisted: true, productId: 10};
      mockedApiClient.post.mockResolvedValue({data: {data: response}});
      const result = await wishlistService.toggleWishlist(10);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/wishlist', {productId: 10});
      expect(result).toEqual(response);
    });
  });

  describe('removeFromWishlist', () => {
    it('should call DELETE /wishlist/:productId', async () => {
      mockedApiClient.delete.mockResolvedValue({data: {}});
      await wishlistService.removeFromWishlist(10);
      expect(mockedApiClient.delete).toHaveBeenCalledWith('/wishlist/10');
    });
  });
});

export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
}

export interface ToggleWishlistResponse {
  wishlisted: boolean;
  productId: number;
}

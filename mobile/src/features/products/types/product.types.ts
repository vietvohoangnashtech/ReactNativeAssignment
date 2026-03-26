export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  priceUnit: 'dollar' | 'euro' | 'inr';
  category?: string;
}

export interface ProductReview {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  message: string;
  createdAt?: string;
  User?: {username: string; firstName: string; lastName: string};
}

export interface CreateReviewPayload {
  rating: number;
  message: string;
}

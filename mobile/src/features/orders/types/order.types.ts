export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'cash_on_delivery';

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress?: string;
  paymentMethod?: string;
  status: string;
  createdAt: string;
}

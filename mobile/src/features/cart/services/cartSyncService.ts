import type {CartItem} from '../types/cart.types';

export interface RemoteCartItem {
  productId: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

/**
 * Additive merge: combines local and remote carts.
 * - Items in both → keep max quantity
 * - Items in only one → include as-is
 */
export function mergeCart(local: CartItem[], remote: RemoteCartItem[]): CartItem[] {
  const merged = new Map<number, CartItem>();

  for (const item of local) {
    merged.set(item.id, {...item});
  }

  for (const item of remote) {
    const existing = merged.get(item.productId);
    if (existing) {
      existing.quantity = Math.max(existing.quantity, item.quantity);
    } else {
      merged.set(item.productId, {
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      });
    }
  }

  return Array.from(merged.values());
}

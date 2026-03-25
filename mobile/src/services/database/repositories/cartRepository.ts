import {database} from '../database';
import {CartItemModel} from '../models/CartItemModel';
import type {CartItem} from '../../../features/cart/types/cart.types';

const cartCollection = database.get<CartItemModel>('cart_items');

export const cartRepository = {
  async saveCart(items: CartItem[]): Promise<void> {
    await database.write(async () => {
      const existing = await cartCollection.query().fetch();
      const deletions = existing.map(r => r.prepareDestroyPermanently());
      const creations = items.map(item =>
        cartCollection.prepareCreate(record => {
          record.productId = item.id;
          record.name = item.name;
          record.price = item.price;
          record.image = item.image ?? '';
          record.quantity = item.quantity;
        }),
      );
      await database.batch(...deletions, ...creations);
    });
  },

  async loadCart(): Promise<CartItem[]> {
    const records = await cartCollection.query().fetch();
    return records.map(r => ({
      id: r.productId,
      name: r.name,
      price: r.price,
      image: r.image !== '' ? r.image : undefined,
      quantity: r.quantity,
    }));
  },

  async clearCart(): Promise<void> {
    await database.write(async () => {
      const records = await cartCollection.query().fetch();
      if (records.length > 0) {
        await database.batch(...records.map(r => r.prepareDestroyPermanently()));
      }
    });
  },
};

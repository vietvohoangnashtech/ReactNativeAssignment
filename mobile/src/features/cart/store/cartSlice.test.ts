import {configureStore} from '@reduxjs/toolkit';
import cartReducer, {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  loadCartFromDB,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  selectCartHydrated,
} from './cartSlice';
import type {CartItem} from '../types/cart.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// WatermelonDB requires native modules - mock the repository entirely
jest.mock('../../../services/database/repositories/cartRepository', () => ({
  cartRepository: {
    loadCart: jest.fn(),
    saveCart: jest.fn(),
  },
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockItem: CartItem = {id: 1, name: 'Widget', price: 10, quantity: 1};
const mockItem2: CartItem = {id: 2, name: 'Gadget', price: 25, quantity: 2};

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeStore(preloadedItems: CartItem[] = []) {
  return configureStore({
    reducer: {cart: cartReducer},
    preloadedState: {cart: {items: preloadedItems, hydrated: false}},
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('cartSlice reducer', () => {
  describe('addItem', () => {
    it('should add a new item with quantity 1 when the item is not in the cart', () => {
      const store = makeStore();
      store.dispatch(addItem({id: 1, name: 'Widget', price: 10}));
      const items = selectCartItems(store.getState());
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({id: 1, name: 'Widget', price: 10, quantity: 1});
    });

    it('should increment quantity when adding an existing item', () => {
      const store = makeStore([mockItem]);
      store.dispatch(addItem({id: 1, name: 'Widget', price: 10}));
      const items = selectCartItems(store.getState());
      expect(items).toHaveLength(1);
      expect(items[0]?.quantity).toBe(2);
    });

    it('should add multiple distinct items independently', () => {
      const store = makeStore([mockItem]);
      store.dispatch(addItem({id: 2, name: 'Gadget', price: 25}));
      expect(selectCartItems(store.getState())).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('should remove an item by id', () => {
      const store = makeStore([mockItem, mockItem2]);
      store.dispatch(removeItem(1));
      const items = selectCartItems(store.getState());
      expect(items).toHaveLength(1);
      expect(items[0]?.id).toBe(2);
    });

    it('should produce empty cart when the last item is removed', () => {
      const store = makeStore([mockItem]);
      store.dispatch(removeItem(1));
      expect(selectCartItems(store.getState())).toHaveLength(0);
    });

    it('should not change state when removing a non-existent item id', () => {
      const store = makeStore([mockItem]);
      store.dispatch(removeItem(999));
      expect(selectCartItems(store.getState())).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update the quantity of an existing item', () => {
      const store = makeStore([mockItem]);
      store.dispatch(updateQuantity({id: 1, quantity: 5}));
      expect(selectCartItems(store.getState())[0]?.quantity).toBe(5);
    });

    it('should remove the item when quantity is set to 0', () => {
      const store = makeStore([mockItem]);
      store.dispatch(updateQuantity({id: 1, quantity: 0}));
      expect(selectCartItems(store.getState())).toHaveLength(0);
    });

    it('should remove the item when quantity is set to a negative number', () => {
      const store = makeStore([mockItem]);
      store.dispatch(updateQuantity({id: 1, quantity: -1}));
      expect(selectCartItems(store.getState())).toHaveLength(0);
    });

    it('should not affect other items in the cart', () => {
      const store = makeStore([mockItem, mockItem2]);
      store.dispatch(updateQuantity({id: 1, quantity: 3}));
      const items = selectCartItems(store.getState());
      const item2 = items.find(i => i.id === 2);
      expect(item2?.quantity).toBe(2);
    });
  });

  describe('clearCart', () => {
    it('should remove all items', () => {
      const store = makeStore([mockItem, mockItem2]);
      store.dispatch(clearCart());
      expect(selectCartItems(store.getState())).toHaveLength(0);
    });

    it('should be safe to call on an empty cart', () => {
      const store = makeStore();
      store.dispatch(clearCart());
      expect(selectCartItems(store.getState())).toHaveLength(0);
    });
  });
});

describe('cartSlice async thunk: loadCartFromDB', () => {
  it('should set items and hydrated=true on fulfilled', () => {
    const preloaded: CartItem[] = [mockItem];
    const store = makeStore();
    store.dispatch({
      type: loadCartFromDB.fulfilled.type,
      payload: preloaded,
    });
    expect(selectCartItems(store.getState())).toEqual(preloaded);
    expect(selectCartHydrated(store.getState())).toBe(true);
  });
});

describe('cartSlice selectors', () => {
  it('selectCartTotal should compute total price across all items', () => {
    const store = makeStore([
      {id: 1, name: 'A', price: 10, quantity: 2},
      {id: 2, name: 'B', price: 5, quantity: 3},
    ]);
    // 10*2 + 5*3 = 35
    expect(selectCartTotal(store.getState())).toBe(35);
  });

  it('selectCartItemCount should sum all item quantities', () => {
    const store = makeStore([
      {id: 1, name: 'A', price: 10, quantity: 2},
      {id: 2, name: 'B', price: 5, quantity: 3},
    ]);
    expect(selectCartItemCount(store.getState())).toBe(5);
  });

  it('selectCartTotal should return 0 for an empty cart', () => {
    const store = makeStore();
    expect(selectCartTotal(store.getState())).toBe(0);
  });

  it('selectCartItemCount should return 0 for an empty cart', () => {
    const store = makeStore();
    expect(selectCartItemCount(store.getState())).toBe(0);
  });
});

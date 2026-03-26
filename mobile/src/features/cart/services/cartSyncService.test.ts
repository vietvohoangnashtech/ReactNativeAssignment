import {mergeCart} from './cartSyncService';
import type {CartItem} from '../types/cart.types';
import type {RemoteCartItem} from './cartSyncService';

describe('cartSyncService', () => {
  describe('mergeCart', () => {
    it('should return empty array when both inputs are empty', () => {
      expect(mergeCart([], [])).toEqual([]);
    });

    it('should return local items when remote is empty', () => {
      const local: CartItem[] = [
        {id: 1, name: 'Product A', price: 10, quantity: 2},
      ];
      const result = mergeCart(local, []);
      expect(result).toEqual(local);
    });

    it('should return mapped remote items when local is empty', () => {
      const remote: RemoteCartItem[] = [
        {productId: 1, name: 'Product A', price: 10, quantity: 3},
      ];
      const result = mergeCart([], remote);
      expect(result).toEqual([
        {id: 1, name: 'Product A', price: 10, quantity: 3},
      ]);
    });

    it('should use max quantity for overlapping items', () => {
      const local: CartItem[] = [
        {id: 1, name: 'Product A', price: 10, quantity: 2},
      ];
      const remote: RemoteCartItem[] = [
        {productId: 1, name: 'Product A', price: 10, quantity: 5},
      ];
      const result = mergeCart(local, remote);
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(5);
    });

    it('should keep local quantity when it is higher', () => {
      const local: CartItem[] = [
        {id: 1, name: 'Product A', price: 10, quantity: 8},
      ];
      const remote: RemoteCartItem[] = [
        {productId: 1, name: 'Product A', price: 10, quantity: 3},
      ];
      const result = mergeCart(local, remote);
      expect(result[0].quantity).toBe(8);
    });

    it('should include items unique to each side', () => {
      const local: CartItem[] = [
        {id: 1, name: 'Local Only', price: 10, quantity: 1},
      ];
      const remote: RemoteCartItem[] = [
        {productId: 2, name: 'Remote Only', price: 20, quantity: 2},
      ];
      const result = mergeCart(local, remote);
      expect(result).toHaveLength(2);
      expect(result.find(i => i.id === 1)?.name).toBe('Local Only');
      expect(result.find(i => i.id === 2)?.name).toBe('Remote Only');
    });

    it('should handle complex merge scenario', () => {
      const local: CartItem[] = [
        {id: 1, name: 'A', price: 10, quantity: 2},
        {id: 2, name: 'B', price: 20, quantity: 5},
        {id: 3, name: 'C', price: 30, quantity: 1},
      ];
      const remote: RemoteCartItem[] = [
        {productId: 2, name: 'B', price: 20, quantity: 3},
        {productId: 4, name: 'D', price: 40, quantity: 7},
      ];
      const result = mergeCart(local, remote);
      expect(result).toHaveLength(4);
      expect(result.find(i => i.id === 1)?.quantity).toBe(2);
      expect(result.find(i => i.id === 2)?.quantity).toBe(5); // local max
      expect(result.find(i => i.id === 3)?.quantity).toBe(1);
      expect(result.find(i => i.id === 4)?.quantity).toBe(7);
    });

    it('should preserve image field from remote items', () => {
      const remote: RemoteCartItem[] = [
        {productId: 1, name: 'A', price: 10, quantity: 1, image: 'http://img.jpg'},
      ];
      const result = mergeCart([], remote);
      expect(result[0].image).toBe('http://img.jpg');
    });
  });
});

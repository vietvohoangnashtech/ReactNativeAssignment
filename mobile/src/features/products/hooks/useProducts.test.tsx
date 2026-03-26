import React from 'react';
import {renderHook, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {useProducts} from './useProducts';
import {productService} from '../services/productService';
import {productCacheRepository} from '../../../services/database/repositories/productCacheRepository';
import rootReducer from '../../../store/rootReducer';
import type {Product} from '../types/product.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// WatermelonDB repositories — must be factory-mocked
jest.mock('../../../services/database/repositories/cartRepository', () => ({
  cartRepository: {
    loadCart: jest.fn().mockResolvedValue([]),
    saveCart: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../services/database/repositories/profileRepository', () => ({
  profileRepository: {
    getProfile: jest.fn().mockResolvedValue(null),
    saveProfile: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../services/database/repositories/productCacheRepository', () => ({
  productCacheRepository: {
    getCachedProducts: jest.fn().mockResolvedValue({products: [], isStale: false}),
    cacheProducts: jest.fn().mockResolvedValue(undefined),
    getCachedCategories: jest.fn().mockResolvedValue([]),
    cacheCategories: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../services/database/repositories/orderCacheRepository', () => ({
  orderCacheRepository: {
    cacheOrders: jest.fn().mockResolvedValue(undefined),
    getCachedOrders: jest.fn().mockResolvedValue([]),
    createPendingOrder: jest.fn(),
    clearAll: jest.fn(),
  },
}));

jest.mock('../../../services/database/repositories/syncQueueRepository', () => ({
  syncQueueRepository: {
    enqueue: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../services/productService');
const mockedProductService = productService as jest.Mocked<typeof productService>;
const mockedProductCacheRepository =
  productCacheRepository as jest.Mocked<typeof productCacheRepository>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Laptop',
    price: 999.99,
    description: 'A laptop',
    image: 'laptop.jpg',
    priceUnit: 'dollar',
    category: 'Electronics',
  },
  {
    id: 2,
    name: 'T-Shirt',
    price: 19.99,
    description: 'A shirt',
    image: 'tshirt.jpg',
    priceUnit: 'dollar',
    category: 'Clothing',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeWrapper() {
  const testStore = configureStore({reducer: rootReducer});
  const Wrapper = ({children}: {children: React.ReactNode}) => (
    <Provider store={testStore}>{children}</Provider>
  );
  return Wrapper;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useProducts hook', () => {
  beforeEach(() => {
    mockedProductService.getProducts.mockReset();
    mockedProductCacheRepository.getCachedProducts.mockResolvedValue({
      products: [],
      isStale: false,
    });
  });

  it('should start with empty products and loading=true', () => {
    mockedProductService.getProducts.mockResolvedValue([]);
    const {result} = renderHook(() => useProducts(), {wrapper: makeWrapper()});
    expect(result.current.products).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should populate products after a successful fetch', async () => {
    mockedProductService.getProducts.mockResolvedValue(mockProducts);
    const {result} = renderHook(() => useProducts(), {wrapper: makeWrapper()});

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBeNull();
  });

  it('should set error when service throws', async () => {
    mockedProductService.getProducts.mockRejectedValue(new Error('Network error'));
    mockedProductCacheRepository.getCachedProducts.mockResolvedValue(null as unknown as {products: Product[]; isStale: boolean});
    const {result} = renderHook(() => useProducts(), {wrapper: makeWrapper()});

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.products).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should expose a refetch function', async () => {
    mockedProductService.getProducts.mockResolvedValue(mockProducts);
    const {result} = renderHook(() => useProducts(), {wrapper: makeWrapper()});

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should call getProducts again when refetch is invoked', async () => {
    mockedProductService.getProducts.mockResolvedValue([]);
    const {result} = renderHook(() => useProducts(), {wrapper: makeWrapper()});

    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.refetch();
    await waitFor(() => expect(mockedProductService.getProducts).toHaveBeenCalledTimes(2));
  });
});

import {useCallback, useEffect, useState} from 'react';
import {recentlyViewedRepository} from '../../../services/database/repositories/recentlyViewedRepository';
import type {Product} from '../types/product.types';

export const useRecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  const loadRecent = useCallback(async () => {
    const products = await recentlyViewedRepository.getRecentlyViewed();
    setRecentProducts(products);
  }, []);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  return {recentProducts, refresh: loadRecent};
};

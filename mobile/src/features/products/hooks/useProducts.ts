import {useCallback, useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../../../store/store';
import {fetchProducts} from '../store/productsSlice';

const useProducts = () => {
  const dispatch = useAppDispatch();
  const {items, loading, error} = useAppSelector(state => state.products);

  const loadProducts = useCallback(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {products: items, loading, error, refetch: loadProducts};
};

export {useProducts};

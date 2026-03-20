import {useCallback, useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../../../store/store';
import {fetchOrders} from '../store/ordersSlice';

const useOrders = () => {
  const dispatch = useAppDispatch();
  const {items, loading, error} = useAppSelector(state => state.orders);

  const loadOrders = useCallback(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {orders: items, loading, error, refetch: loadOrders};
};

export {useOrders};

import {useEffect, useState} from 'react';
import {networkService} from './NetworkService';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(networkService.isOnline);

  useEffect(() => {
    const unsubscribe = networkService.onStatusChange(setIsOnline);
    return unsubscribe;
  }, []);

  return {isOnline};
}

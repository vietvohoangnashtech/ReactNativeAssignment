import {useEffect, useState} from 'react';
import {syncService} from './SyncService';
import type {SyncStatusValue} from './SyncStatus';

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatusValue>(syncService.status);

  useEffect(() => {
    const unsubscribe = syncService.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  return {syncStatus: status, triggerSync: () => syncService.sync()};
}

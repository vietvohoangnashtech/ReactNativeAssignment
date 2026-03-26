export type SyncStatusValue = 'idle' | 'syncing' | 'error' | 'completed';

export interface SyncState {
  status: SyncStatusValue;
  lastSyncedAt: number | null;
  pendingCount: number;
  errorMessage: string | null;
}

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from './store';
import type {SyncStatusValue} from '../services/sync/SyncStatus';

interface SyncSliceState {
  status: SyncStatusValue;
  lastSyncedAt: number | null;
  pendingCount: number;
  errorMessage: string | null;
}

const initialState: SyncSliceState = {
  status: 'idle',
  lastSyncedAt: null,
  pendingCount: 0,
  errorMessage: null,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setSyncStatus(state, action: PayloadAction<SyncStatusValue>) {
      state.status = action.payload;
      if (action.payload === 'completed') {
        state.lastSyncedAt = Date.now();
        state.errorMessage = null;
      }
    },
    setSyncError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.errorMessage = action.payload;
    },
    setPendingCount(state, action: PayloadAction<number>) {
      state.pendingCount = action.payload;
    },
  },
});

export const {setSyncStatus, setSyncError, setPendingCount} = syncSlice.actions;
export const selectSyncStatus = (state: RootState) => state.sync.status;
export const selectLastSyncedAt = (state: RootState) => state.sync.lastSyncedAt;
export const selectPendingCount = (state: RootState) => state.sync.pendingCount;
export const selectSyncError = (state: RootState) => state.sync.errorMessage;
export default syncSlice.reducer;

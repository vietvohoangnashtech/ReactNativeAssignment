import {configureStore} from '@reduxjs/toolkit';
import syncReducer, {
  setSyncStatus,
  setSyncError,
  setPendingCount,
  selectSyncStatus,
  selectLastSyncedAt,
  selectPendingCount,
  selectSyncError,
} from './syncSlice';

function makeStore() {
  return configureStore({reducer: {sync: syncReducer}});
}

describe('syncSlice', () => {
  it('should have correct initial state', () => {
    const store = makeStore();
    expect(store.getState().sync).toEqual({
      status: 'idle',
      lastSyncedAt: null,
      pendingCount: 0,
      errorMessage: null,
    });
  });

  describe('setSyncStatus', () => {
    it('should update status to syncing', () => {
      const store = makeStore();
      store.dispatch(setSyncStatus('syncing'));
      expect(store.getState().sync.status).toBe('syncing');
    });

    it('should set lastSyncedAt and clear errorMessage on completed', () => {
      const store = makeStore();
      store.dispatch(setSyncError('some error'));
      const before = Date.now();
      store.dispatch(setSyncStatus('completed'));
      const after = Date.now();
      const state = store.getState().sync;
      expect(state.status).toBe('completed');
      expect(state.errorMessage).toBeNull();
      expect(state.lastSyncedAt).toBeGreaterThanOrEqual(before);
      expect(state.lastSyncedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('setSyncError', () => {
    it('should set status to error with message', () => {
      const store = makeStore();
      store.dispatch(setSyncError('Network failed'));
      const state = store.getState().sync;
      expect(state.status).toBe('error');
      expect(state.errorMessage).toBe('Network failed');
    });
  });

  describe('setPendingCount', () => {
    it('should update pendingCount', () => {
      const store = makeStore();
      store.dispatch(setPendingCount(5));
      expect(store.getState().sync.pendingCount).toBe(5);
    });
  });

  describe('selectors', () => {
    it('should return correct values', () => {
      const store = makeStore();
      const state = store.getState() as any;
      expect(selectSyncStatus(state)).toBe('idle');
      expect(selectLastSyncedAt(state)).toBeNull();
      expect(selectPendingCount(state)).toBe(0);
      expect(selectSyncError(state)).toBeNull();
    });
  });
});

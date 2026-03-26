import {configureStore} from '@reduxjs/toolkit';
import networkReducer, {
  setOnlineStatus,
  selectIsOnline,
  selectLastOnlineAt,
} from './networkSlice';

function makeStore() {
  return configureStore({reducer: {network: networkReducer}});
}

describe('networkSlice', () => {
  it('should have correct initial state', () => {
    const store = makeStore();
    expect(store.getState().network).toEqual({
      isOnline: true,
      lastOnlineAt: null,
    });
  });

  it('should set isOnline to false', () => {
    const store = makeStore();
    store.dispatch(setOnlineStatus(false));
    expect(store.getState().network.isOnline).toBe(false);
    expect(store.getState().network.lastOnlineAt).toBeNull();
  });

  it('should set lastOnlineAt when going online', () => {
    const store = makeStore();
    const before = Date.now();
    store.dispatch(setOnlineStatus(true));
    const after = Date.now();
    const lastOnline = store.getState().network.lastOnlineAt!;
    expect(lastOnline).toBeGreaterThanOrEqual(before);
    expect(lastOnline).toBeLessThanOrEqual(after);
  });

  describe('selectors', () => {
    it('selectIsOnline returns isOnline', () => {
      const store = makeStore();
      expect(selectIsOnline(store.getState() as any)).toBe(true);
      store.dispatch(setOnlineStatus(false));
      expect(selectIsOnline(store.getState() as any)).toBe(false);
    });

    it('selectLastOnlineAt returns lastOnlineAt', () => {
      const store = makeStore();
      expect(selectLastOnlineAt(store.getState() as any)).toBeNull();
      store.dispatch(setOnlineStatus(true));
      expect(selectLastOnlineAt(store.getState() as any)).toBeGreaterThan(0);
    });
  });
});

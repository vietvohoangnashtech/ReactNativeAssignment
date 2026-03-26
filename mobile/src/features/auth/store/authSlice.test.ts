import {configureStore} from '@reduxjs/toolkit';
import authReducer, {setLoading, setError, clearAuthError} from './authSlice';

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeStore() {
  return configureStore({reducer: {auth: authReducer}});
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('authSlice reducer', () => {
  it('should return the initial state', () => {
    const store = makeStore();
    expect(store.getState().auth).toEqual({loading: false, error: null});
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const store = makeStore();
      store.dispatch(setLoading(true));
      expect(store.getState().auth.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const store = configureStore({
        reducer: {auth: authReducer},
        preloadedState: {auth: {loading: true, error: null}},
      });
      store.dispatch(setLoading(false));
      expect(store.getState().auth.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set an error message', () => {
      const store = makeStore();
      store.dispatch(setError('Invalid credentials'));
      expect(store.getState().auth.error).toBe('Invalid credentials');
    });

    it('should clear the error when null is passed', () => {
      const store = configureStore({
        reducer: {auth: authReducer},
        preloadedState: {auth: {loading: false, error: 'some error'}},
      });
      store.dispatch(setError(null));
      expect(store.getState().auth.error).toBeNull();
    });
  });

  describe('clearAuthError', () => {
    it('should clear the current error', () => {
      const store = configureStore({
        reducer: {auth: authReducer},
        preloadedState: {auth: {loading: false, error: 'Auth failed'}},
      });
      store.dispatch(clearAuthError());
      expect(store.getState().auth.error).toBeNull();
    });
  });
});

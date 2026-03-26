import React from 'react';
import {act, renderHook, waitFor} from '@testing-library/react-native';
import {AuthProvider, useAuthContext} from './AuthContext';
import EncryptedStorage from 'react-native-encrypted-storage';
import {jwtDecode} from 'jwt-decode';
import type {User} from '../features/auth/types/auth.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-native-encrypted-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

const mockedEncryptedStorage = EncryptedStorage as jest.Mocked<typeof EncryptedStorage>;
const mockedJwtDecode = jwtDecode as jest.Mock;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser: User = {
  id: 1,
  username: 'johndoe',
  email: 'john@example.com',
  age: 30,
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
};

const VALID_TOKEN = 'valid.jwt.token';
// exp = current time + 1 hour (not expired)
const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;
const PAST_EXP = Math.floor(Date.now() / 1000) - 3600;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeWrapper() {
  return ({children}: {children: React.ReactNode}) => (
    <AuthProvider>{children}</AuthProvider>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedEncryptedStorage.setItem.mockResolvedValue(undefined);
    mockedEncryptedStorage.removeItem.mockResolvedValue(undefined);
  });

  describe('initial load', () => {
    it('should start with loading=true then resolve to logged-out when no token stored', async () => {
      mockedEncryptedStorage.getItem.mockResolvedValue(null);
      const {result} = renderHook(() => useAuthContext(), {wrapper: makeWrapper()});

      expect(result.current.loading).toBe(true);

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isLoggedIn).toBe(false);
      expect(result.current.token).toBeNull();
    });

    it('should restore session when a valid non-expired token is stored', async () => {
      mockedEncryptedStorage.getItem
        .mockResolvedValueOnce(VALID_TOKEN) // auth_token
        .mockResolvedValueOnce(JSON.stringify(mockUser)); // auth_user
      mockedJwtDecode.mockReturnValue({exp: FUTURE_EXP});

      const {result} = renderHook(() => useAuthContext(), {wrapper: makeWrapper()});

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isLoggedIn).toBe(true);
      expect(result.current.token).toBe(VALID_TOKEN);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should remove expired token and stay logged out', async () => {
      mockedEncryptedStorage.getItem.mockResolvedValueOnce(VALID_TOKEN);
      mockedJwtDecode.mockReturnValue({exp: PAST_EXP});

      const {result} = renderHook(() => useAuthContext(), {wrapper: makeWrapper()});

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isLoggedIn).toBe(false);
      expect(mockedEncryptedStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockedEncryptedStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });

    it('should treat token with no exp as expired', async () => {
      mockedEncryptedStorage.getItem.mockResolvedValueOnce(VALID_TOKEN);
      mockedJwtDecode.mockReturnValue({}); // no exp field

      const {result} = renderHook(() => useAuthContext(), {wrapper: makeWrapper()});

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isLoggedIn).toBe(false);
    });

    it('should stay logged out when storage read throws', async () => {
      mockedEncryptedStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const {result} = renderHook(() => useAuthContext(), {wrapper: makeWrapper()});

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isLoggedIn).toBe(false);
    });
  });

  describe('login', () => {
    it('should persist token + user and set isLoggedIn=true', async () => {
      mockedEncryptedStorage.getItem.mockResolvedValue(null);
      const {result} = renderHook(() => useAuthContext(), {wrapper: makeWrapper()});

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.login(VALID_TOKEN, mockUser);
      });

      expect(mockedEncryptedStorage.setItem).toHaveBeenCalledWith('auth_token', VALID_TOKEN);
      expect(mockedEncryptedStorage.setItem).toHaveBeenCalledWith(
        'auth_user',
        JSON.stringify(mockUser),
      );
      expect(result.current.isLoggedIn).toBe(true);
      expect(result.current.token).toBe(VALID_TOKEN);
      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear storage and set isLoggedIn=false', async () => {
      // Start with valid session
      mockedEncryptedStorage.getItem
        .mockResolvedValueOnce(VALID_TOKEN)
        .mockResolvedValueOnce(JSON.stringify(mockUser));
      mockedJwtDecode.mockReturnValue({exp: FUTURE_EXP});

      const {result} = renderHook(() => useAuthContext(), {wrapper: makeWrapper()});
      await waitFor(() => expect(result.current.isLoggedIn).toBe(true));

      await act(async () => {
        await result.current.logout();
      });

      expect(mockedEncryptedStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockedEncryptedStorage.removeItem).toHaveBeenCalledWith('auth_user');
      expect(result.current.isLoggedIn).toBe(false);
      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update the user in state and persist to storage', async () => {
      mockedEncryptedStorage.getItem
        .mockResolvedValueOnce(VALID_TOKEN)
        .mockResolvedValueOnce(JSON.stringify(mockUser));
      mockedJwtDecode.mockReturnValue({exp: FUTURE_EXP});

      const {result} = renderHook(() => useAuthContext(), {wrapper: makeWrapper()});
      await waitFor(() => expect(result.current.isLoggedIn).toBe(true));

      const updated: User = {...mockUser, firstName: 'Jane'};

      act(() => {
        result.current.updateUser(updated);
      });

      expect(result.current.user).toEqual(updated);
      expect(mockedEncryptedStorage.setItem).toHaveBeenCalledWith(
        'auth_user',
        JSON.stringify(updated),
      );
    });
  });

  describe('useAuthContext guard', () => {
    it('should throw when consumed outside AuthProvider', () => {
      // Suppress the console.error from React about the throw
      jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuthContext());
      }).toThrow('useAuthContext must be used within AuthProvider');
    });
  });
});

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import {jwtDecode} from 'jwt-decode';
import {biometricService} from '../features/auth/services/biometricService';
import type {User} from '../features/auth/types/auth.types';

interface AuthContextValue {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  loading: boolean;
  biometricAvailable: boolean;
  login: (token: string, user: User) => Promise<void>;
  loginWithBiometric: () => Promise<boolean>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({children}: AuthProviderProps): React.JSX.Element => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await EncryptedStorage.getItem('auth_token');
        if (storedToken) {
          const decoded = jwtDecode(storedToken);
          const isExpired = decoded.exp
            ? Date.now() >= decoded.exp * 1000
            : true;
          if (isExpired) {
            await EncryptedStorage.removeItem('auth_token');
            await EncryptedStorage.removeItem('auth_user');
          } else {
            const storedUser = await EncryptedStorage.getItem('auth_user');
            setToken(storedToken);
            setIsLoggedIn(true);
            if (storedUser) {
              setUser(JSON.parse(storedUser) as User);
            }
          }
        }
        // Check biometric availability
        const bioEnabled = await biometricService.isBiometricEnabled();
        setBiometricAvailable(bioEnabled);
      } catch {
        // storage read error — stay logged out
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = useCallback(async (newToken: string, newUser: User) => {
    await EncryptedStorage.setItem('auth_token', newToken);
    await EncryptedStorage.setItem('auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
  }, []);

  const loginWithBiometric = useCallback(async (): Promise<boolean> => {
    const credentials = await biometricService.getStoredCredentials();
    if (!credentials) {
      return false;
    }
    const decoded = jwtDecode(credentials.token);
    const isExpired = decoded.exp ? Date.now() >= decoded.exp * 1000 : true;
    if (isExpired) {
      await biometricService.disableBiometric();
      setBiometricAvailable(false);
      return false;
    }
    const storedUser = JSON.parse(credentials.userJson) as User;
    await EncryptedStorage.setItem('auth_token', credentials.token);
    await EncryptedStorage.setItem('auth_user', credentials.userJson);
    setToken(credentials.token);
    setUser(storedUser);
    setIsLoggedIn(true);
    return true;
  }, []);

  const enableBiometric = useCallback(async () => {
    if (token && user) {
      await biometricService.enableBiometric(token, JSON.stringify(user));
      setBiometricAvailable(true);
    }
  }, [token, user]);

  const disableBiometric = useCallback(async () => {
    await biometricService.disableBiometric();
    setBiometricAvailable(false);
  }, []);

  const logout = useCallback(async () => {
    await EncryptedStorage.removeItem('auth_token');
    await EncryptedStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    EncryptedStorage.setItem('auth_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{isLoggedIn, token, user, loading, biometricAvailable, login, loginWithBiometric, enableBiometric, disableBiometric, logout, updateUser}}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
};

export {AuthProvider, useAuthContext};

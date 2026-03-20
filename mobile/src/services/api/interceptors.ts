import EncryptedStorage from 'react-native-encrypted-storage';
import apiClient from './client';

export function setupInterceptors(onUnauthorized?: () => void): void {
  apiClient.interceptors.request.use(
    async config => {
      try {
        const token = await EncryptedStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // no stored token
      }
      return config;
    },
    error => Promise.reject(error),
  );

  apiClient.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return Promise.reject(error);
    },
  );
}

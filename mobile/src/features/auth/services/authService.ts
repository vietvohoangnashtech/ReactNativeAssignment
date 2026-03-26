import apiClient from '../../../services/api/client';
import type {ApiResponse} from '../../../types/api/response.types';
import type {User, LoginPayload, RegisterPayload} from '../types/auth.types';

interface LoginData {
  token: string;
  user: User;
}

const authService = {
  login: async (payload: LoginPayload): Promise<LoginData> => {
    const response = await apiClient.post<ApiResponse<LoginData>>('/login', payload);
    return response.data.data;
  },

  register: async (payload: RegisterPayload): Promise<LoginData> => {
    const response = await apiClient.post<ApiResponse<LoginData>>('/signup', payload);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/logout');
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', {email});
  },

  resetPassword: async (resetToken: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', {resetToken, newPassword});
  },
};

export {authService};

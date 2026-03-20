import apiClient from '../../../services/api/client';
import type {ApiResponse} from '../../../types/api/response.types';
import type {UserProfile, UpdateProfilePayload} from '../types/profile.types';

const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/user');
    return response.data.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const response = await apiClient.patch<ApiResponse<UserProfile>>('/user', payload);
    return response.data.data;
  },
};

export {userService};

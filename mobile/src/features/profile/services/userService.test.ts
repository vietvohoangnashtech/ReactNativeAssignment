import apiClient from '../../../services/api/client';
import {userService} from './userService';
import type {UserProfile, UpdateProfilePayload} from '../types/profile.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../../services/api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProfile: UserProfile = {
  id: 1,
  username: 'johndoe',
  email: 'john@example.com',
  age: 30,
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile from API', async () => {
      mockedApiClient.get.mockResolvedValue({data: {data: mockProfile}});

      const result = await userService.getProfile();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/user');
      expect(result).toEqual(mockProfile);
    });

    it('should propagate API errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Unauthorized'));
      await expect(userService.getProfile()).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateProfile', () => {
    const payload: UpdateProfilePayload = {firstName: 'Jane', lastName: 'Smith', age: 25};
    const updatedProfile: UserProfile = {...mockProfile, firstName: 'Jane', lastName: 'Smith', age: 25};

    it('should PATCH /user and return updated profile', async () => {
      mockedApiClient.patch.mockResolvedValue({data: {data: updatedProfile}});

      const result = await userService.updateProfile(payload);

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/user', payload);
      expect(result).toEqual(updatedProfile);
    });

    it('should propagate API errors', async () => {
      mockedApiClient.patch.mockRejectedValue(new Error('Validation failed'));
      await expect(userService.updateProfile(payload)).rejects.toThrow('Validation failed');
    });
  });
});

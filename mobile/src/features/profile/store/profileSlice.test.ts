import {configureStore} from '@reduxjs/toolkit';
import profileReducer, {
  fetchProfile,
  updateProfile,
  clearProfile,
} from './profileSlice';
import {userService} from '../services/userService';
import {profileRepository} from '../../../services/database/repositories/profileRepository';
import type {UserProfile} from '../types/profile.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../services/userService');
// Provide explicit factory to prevent WatermelonDB native module from loading
jest.mock('../../../services/database/repositories/profileRepository', () => ({
  profileRepository: {
    getProfile: jest.fn(),
    saveProfile: jest.fn(),
  },
}));

const mockedUserService = userService as jest.Mocked<typeof userService>;
const mockedProfileRepository = profileRepository as jest.Mocked<
  typeof profileRepository
>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProfile: UserProfile = {
  id: 1,
  username: 'jdoe',
  email: 'jdoe@example.com',
  age: 30,
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeStore() {
  return configureStore({reducer: {profile: profileReducer}});
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('profileSlice reducer', () => {
  beforeEach(() => {
    mockedUserService.getProfile.mockReset();
    mockedUserService.updateProfile.mockReset();
    mockedProfileRepository.saveProfile.mockReset();
    mockedProfileRepository.getProfile.mockReset();
  });

  it('should return the correct initial state', () => {
    const store = makeStore();
    expect(store.getState().profile).toEqual({
      data: null,
      loading: false,
      saving: false,
      error: null,
      isOffline: false,
    });
  });

  describe('clearProfile', () => {
    it('should clear data, error, and isOffline', () => {
      const store = configureStore({
        reducer: {profile: profileReducer},
        preloadedState: {
          profile: {
            data: mockProfile,
            loading: false,
            saving: false,
            error: 'some error',
            isOffline: true,
          },
        },
      });
      store.dispatch(clearProfile());
      const state = store.getState().profile;
      expect(state.data).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isOffline).toBe(false);
    });
  });

  describe('fetchProfile thunk', () => {
    it('should set loading=true on pending', () => {
      const store = makeStore();
      store.dispatch({type: fetchProfile.pending.type});
      expect(store.getState().profile.loading).toBe(true);
      expect(store.getState().profile.error).toBeNull();
    });

    it('should populate data with isOffline=false on online success', async () => {
      mockedUserService.getProfile.mockResolvedValue(mockProfile);
      mockedProfileRepository.saveProfile.mockResolvedValue(undefined);
      const store = makeStore();
      await store.dispatch(fetchProfile());
      const state = store.getState().profile;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(mockProfile);
      expect(state.isOffline).toBe(false);
    });

    it('should fall back to cached profile with isOffline=true when API fails', async () => {
      mockedUserService.getProfile.mockRejectedValue(new Error('Network'));
      mockedProfileRepository.getProfile.mockResolvedValue(mockProfile);
      const store = makeStore();
      await store.dispatch(fetchProfile());
      const state = store.getState().profile;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(mockProfile);
      expect(state.isOffline).toBe(true);
    });

    it('should set error when API fails and no cache is available', async () => {
      mockedUserService.getProfile.mockRejectedValue(new Error('Network'));
      mockedProfileRepository.getProfile.mockResolvedValue(null);
      const store = makeStore();
      await store.dispatch(fetchProfile());
      const state = store.getState().profile;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to load profile');
      expect(state.data).toBeNull();
    });
  });

  describe('updateProfile thunk', () => {
    it('should set saving=true on pending', () => {
      const store = makeStore();
      store.dispatch({type: updateProfile.pending.type});
      expect(store.getState().profile.saving).toBe(true);
      expect(store.getState().profile.error).toBeNull();
    });

    it('should update data and clear saving on success', async () => {
      const updated: UserProfile = {...mockProfile, firstName: 'Jane'};
      mockedUserService.updateProfile.mockResolvedValue(updated);
      mockedProfileRepository.saveProfile.mockResolvedValue(undefined);
      const store = makeStore();
      await store.dispatch(updateProfile({firstName: 'Jane'}));
      const state = store.getState().profile;
      expect(state.saving).toBe(false);
      expect(state.data?.firstName).toBe('Jane');
      expect(state.error).toBeNull();
    });

    it('should set error and clear saving on failure', async () => {
      mockedUserService.updateProfile.mockRejectedValue(new Error('Update failed'));
      mockedProfileRepository.saveProfile.mockResolvedValue(undefined);
      const store = makeStore();
      await store.dispatch(updateProfile({firstName: 'Jane'}));
      const state = store.getState().profile;
      expect(state.saving).toBe(false);
      expect(state.error).toBe('Update failed');
    });

    it('should use fallback error message when error is not an Error instance', async () => {
      mockedUserService.updateProfile.mockRejectedValue('string error');
      mockedProfileRepository.saveProfile.mockResolvedValue(undefined);
      const store = makeStore();
      await store.dispatch(updateProfile({firstName: 'Jane'}));
      expect(store.getState().profile.error).toBe('Failed to update profile');
    });
  });
});

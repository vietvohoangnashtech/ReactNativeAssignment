import React from 'react';
import {renderHook, waitFor, act} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {useProfile} from './useProfile';
import {userService} from '../services/userService';
import rootReducer from '../../../store/rootReducer';
import type {UserProfile} from '../types/profile.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../../services/database/repositories/cartRepository', () => ({
  cartRepository: {
    loadCart: jest.fn().mockResolvedValue([]),
    saveCart: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../services/database/repositories/profileRepository', () => ({
  profileRepository: {
    getProfile: jest.fn(),
    saveProfile: jest.fn(),
  },
}));

jest.mock('../services/userService');
const mockedUserService = userService as jest.Mocked<typeof userService>;

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeWrapper() {
  const testStore = configureStore({reducer: rootReducer});
  const Wrapper = ({children}: {children: React.ReactNode}) => (
    <Provider store={testStore}>{children}</Provider>
  );
  return Wrapper;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useProfile hook', () => {
  // Access mocked functions via jest.requireMock to avoid hoisting issues
  const {profileRepository: mockProfileRepo} = jest.requireMock(
    '../../../services/database/repositories/profileRepository',
  ) as {profileRepository: {getProfile: jest.Mock; saveProfile: jest.Mock}};

  beforeEach(() => {
    jest.clearAllMocks();
    mockProfileRepo.saveProfile.mockResolvedValue(undefined);
    mockProfileRepo.getProfile.mockResolvedValue(null);
  });

  it('should start with profile=null and loading=true', () => {
    mockedUserService.getProfile.mockResolvedValue(mockProfile);
    const {result} = renderHook(() => useProfile(), {wrapper: makeWrapper()});
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('should load profile from API successfully', async () => {
    mockedUserService.getProfile.mockResolvedValue(mockProfile);
    const {result} = renderHook(() => useProfile(), {wrapper: makeWrapper()});

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.error).toBeNull();
    expect(result.current.isOffline).toBe(false);
  });

  it('should fall back to cached profile when API fails', async () => {
    mockedUserService.getProfile.mockRejectedValue(new Error('Network error'));
    mockProfileRepo.getProfile.mockResolvedValue(mockProfile);
    const {result} = renderHook(() => useProfile(), {wrapper: makeWrapper()});

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.isOffline).toBe(true);
  });

  it('should set error when API fails and no cached profile exists', async () => {
    mockedUserService.getProfile.mockRejectedValue(new Error('Network error'));
    mockProfileRepo.getProfile.mockResolvedValue(null);
    const {result} = renderHook(() => useProfile(), {wrapper: makeWrapper()});

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.profile).toBeNull();
  });

  it('should expose a saveProfile function', async () => {
    mockedUserService.getProfile.mockResolvedValue(mockProfile);
    const {result} = renderHook(() => useProfile(), {wrapper: makeWrapper()});

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(typeof result.current.saveProfile).toBe('function');
  });

  it('should update profile when saveProfile is called', async () => {
    const updated = {...mockProfile, firstName: 'Jane'};
    mockedUserService.getProfile.mockResolvedValue(mockProfile);
    mockedUserService.updateProfile.mockResolvedValue(updated);
    const {result} = renderHook(() => useProfile(), {wrapper: makeWrapper()});

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.saveProfile({firstName: 'Jane'});
    });

    expect(result.current.profile).toEqual(updated);
  });
});

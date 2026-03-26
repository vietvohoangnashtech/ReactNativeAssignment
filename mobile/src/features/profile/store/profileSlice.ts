import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {profileRepository} from '../../../services/database/repositories/profileRepository';
import {syncQueueRepository} from '../../../services/database/repositories/syncQueueRepository';
import {userService} from '../services/userService';
import type {UserProfile, UpdateProfilePayload} from '../types/profile.types';

interface ProfileState {
  data: UserProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isOffline: boolean;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  saving: false,
  error: null,
  isOffline: false,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (_, {rejectWithValue}) => {
    try {
      const profile = await userService.getProfile();
      await profileRepository.saveProfile(profile);
      return {profile, isOffline: false};
    } catch {
      const cached = await profileRepository.getProfile();
      if (cached) {
        return {profile: cached, isOffline: true};
      }
      return rejectWithValue('Failed to load profile');
    }
  },
);

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (payload: UpdateProfilePayload, {rejectWithValue}) => {
    try {
      const profile = await userService.updateProfile(payload);
      await profileRepository.saveProfile(profile);
      return profile;
    } catch {
      // Offline: save locally + enqueue sync
      const cached = await profileRepository.getProfile();
      if (cached) {
        const updated = {...cached, ...payload};
        await profileRepository.saveProfile(updated);
        await syncQueueRepository.enqueue({
          entityType: 'profile',
          entityId: String(cached.id),
          operation: 'update',
          payload: {...payload, updatedAt: Date.now()},
        });
        return updated;
      }
      return rejectWithValue('Failed to update profile');
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile(state) {
      state.data = null;
      state.error = null;
      state.isOffline = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, {payload}) => {
        state.loading = false;
        state.data = payload.profile;
        state.isOffline = payload.isOffline;
      })
      .addCase(fetchProfile.rejected, (state, {payload}) => {
        state.loading = false;
        state.error = (payload as string) ?? 'Failed to load profile';
      })
      .addCase(updateProfile.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, {payload}) => {
        state.saving = false;
        state.data = payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, {payload}) => {
        state.saving = false;
        state.error = (payload as string) ?? 'Failed to update profile';
      });
  },
});

export const {clearProfile} = profileSlice.actions;
export default profileSlice.reducer;

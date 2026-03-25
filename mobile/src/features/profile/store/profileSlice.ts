import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {userService} from '../services/userService';
import type {UserProfile, UpdateProfilePayload} from '../types/profile.types';

const CACHE_KEY = 'profile_cache';

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
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(profile));
      return {profile, isOffline: false};
    } catch {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return {profile: JSON.parse(cached) as UserProfile, isOffline: true};
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
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(profile));
      return profile;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      return rejectWithValue(message);
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

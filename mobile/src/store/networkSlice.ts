import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from './store';

interface NetworkState {
  isOnline: boolean;
  lastOnlineAt: number | null;
}

const initialState: NetworkState = {
  isOnline: true,
  lastOnlineAt: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setOnlineStatus(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
      if (action.payload) {
        state.lastOnlineAt = Date.now();
      }
    },
  },
});

export const {setOnlineStatus} = networkSlice.actions;
export const selectIsOnline = (state: RootState) => state.network.isOnline;
export const selectLastOnlineAt = (state: RootState) => state.network.lastOnlineAt;
export default networkSlice.reducer;

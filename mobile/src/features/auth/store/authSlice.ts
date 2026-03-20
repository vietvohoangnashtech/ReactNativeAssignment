import {createSlice} from '@reduxjs/toolkit';

interface AuthUiState {
  loading: boolean;
  error: string | null;
}

const initialState: AuthUiState = {
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action: {payload: boolean}) {
      state.loading = action.payload;
    },
    setError(state, action: {payload: string | null}) {
      state.error = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
});

export const {setLoading, setError, clearAuthError} = authSlice.actions;
export default authSlice.reducer;

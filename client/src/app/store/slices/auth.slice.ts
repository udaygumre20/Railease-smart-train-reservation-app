import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthTokens, AuthState } from '@/types';
import { STORAGE_KEYS } from '@/constants/app.constants';
import { storageService } from '@/services/storage.service';

// ============================================================
// Auth Slice — Authentication state (NOT server-state)
// ============================================================

const initialState: AuthState = {
  user: storageService.get<User>(STORAGE_KEYS.USER),
  tokens: (() => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  })(),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.isLoading = false;

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, action.payload.tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, action.payload.tokens.refreshToken);
      storageService.set(STORAGE_KEYS.USER, action.payload.user);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      storageService.set(STORAGE_KEYS.USER, action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    logout(state) {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      storageService.remove(STORAGE_KEYS.USER);
    },
  },
});

export const { setCredentials, setUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;

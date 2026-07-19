import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode, ResolvedTheme } from '@/types';
import { STORAGE_KEYS } from '@/constants/app.constants';

// ============================================================
// Theme Slice
// ============================================================

interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
}

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

const initialMode = getInitialMode();

const initialState: ThemeState = {
  mode: initialMode,
  resolved: resolveTheme(initialMode),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      state.resolved = resolveTheme(action.payload);
      localStorage.setItem(STORAGE_KEYS.THEME, action.payload);
      document.documentElement.setAttribute('data-theme', state.resolved);
    },
    toggleTheme(state) {
      const next: ThemeMode = state.resolved === 'light' ? 'dark' : 'light';
      state.mode = next;
      state.resolved = next;
      localStorage.setItem(STORAGE_KEYS.THEME, next);
      document.documentElement.setAttribute('data-theme', next);
    },
    syncSystemTheme(state) {
      if (state.mode === 'system') {
        state.resolved = resolveTheme('system');
        document.documentElement.setAttribute('data-theme', state.resolved);
      }
    },
  },
});

export const { setThemeMode, toggleTheme, syncSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/theme.slice';
import uiReducer from './slices/ui.slice';
import authReducer from './slices/auth.slice';

// ============================================================
// Redux Store
// ============================================================

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    ui: uiReducer,
    auth: authReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

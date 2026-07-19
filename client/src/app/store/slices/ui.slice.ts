import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// ============================================================
// UI Slice — Global transient UI state
// ============================================================

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface UiState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  globalLoading: boolean;
  toasts: ToastItem[];
}

const initialState: UiState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  globalLoading: false,
  toasts: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen(state, action: PayloadAction<boolean>) {
      state.mobileMenuOpen = action.payload;
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
    addToast(state, action: PayloadAction<ToastItem>) {
      state.toasts.push(action.payload);
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setGlobalLoading,
  addToast,
  removeToast,
  clearToasts,
} = uiSlice.actions;

export type { ToastItem };
export default uiSlice.reducer;

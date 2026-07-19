import { useAppDispatch, useAppSelector } from '@/app/store';
import { setThemeMode, toggleTheme } from '@/app/store/slices/theme.slice';
import type { ThemeMode, ResolvedTheme } from '@/types';

// ============================================================
// useTheme — read and control theme state
// ============================================================

interface UseThemeReturn {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
  toggle: () => void;
  isDark: boolean;
}

export function useTheme(): UseThemeReturn {
  const dispatch = useAppDispatch();
  const { mode, resolved } = useAppSelector((s) => s.theme);

  return {
    mode,
    resolved,
    setTheme: (m: ThemeMode) => dispatch(setThemeMode(m)),
    toggle: () => dispatch(toggleTheme()),
    isDark: resolved === 'dark',
  };
}

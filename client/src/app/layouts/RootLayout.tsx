import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router';
import { useAppSelector, useAppDispatch, syncSystemTheme } from '@/app/store';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';

// ============================================================
// Root Layout — applies theme, wraps in Suspense
// ============================================================

export function RootLayout() {
  const dispatch = useAppDispatch();
  const resolved = useAppSelector((s) => s.theme.resolved);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  // Listen for OS theme changes when mode === 'system'
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => dispatch(syncSystemTheme());
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [dispatch]);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

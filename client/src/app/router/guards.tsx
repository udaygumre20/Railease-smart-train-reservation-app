import { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '@/app/store';

// ============================================================
// Route Guards
// ============================================================

/** Blocks unauthenticated users — redirects to login. */
export function ProtectedRoute(): ReactNode {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/** Blocks authenticated users — redirects to dashboard. */
export function GuestRoute(): ReactNode {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

/** Blocks non-admin users — redirects to dashboard. */
export function AdminRoute(): ReactNode {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

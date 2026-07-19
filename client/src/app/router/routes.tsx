import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { ProtectedRoute, GuestRoute, AdminRoute } from './guards';

// ============================================================
// Layouts (eager — structural, small)
// ============================================================
import { RootLayout } from '@/app/layouts/RootLayout';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { AdminLayout } from '@/app/layouts/AdminLayout';

// ============================================================
// Error Pages (lazy)
// ============================================================
const NotFoundPage = lazy(() => import('@/components/feedback/NotFoundPage'));
const ServerErrorPage = lazy(() => import('@/components/feedback/ServerErrorPage'));

// ============================================================
// Route Definitions
// ============================================================

/**
 * Central route configuration.
 * Business screens are NOT defined here yet — they will be
 * added inside each feature module and composed here.
 */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      // ── Public Routes ──────────────────────────────────────
      {
        element: <PublicLayout />,
        children: [
          {
            index: true,
            // Placeholder: will be replaced by the Home screen
            lazy: () => import('@/components/feedback/PlaceholderPage'),
          },
        ],
      },

      // ── Guest-Only Routes (Login / Register) ──────────────
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: 'login',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
              {
                path: 'register',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
              {
                path: 'forgot-password',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
            ],
          },
        ],
      },

      // ── Protected Routes ───────────────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: 'dashboard',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
              {
                path: 'search',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
              {
                path: 'trains',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
              {
                path: 'booking/:bookingId',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
              {
                path: 'tickets',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
              {
                path: 'profile',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
              {
                path: 'notifications',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
            ],
          },
        ],
      },

      // ── Admin Routes ───────────────────────────────────────
      {
        element: <AdminRoute />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              {
                path: 'dashboard',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
              {
                path: 'users',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
              {
                path: 'trains',
                lazy: () => import('@/components/feedback/PlaceholderPage'),
              },
            ],
          },
        ],
      },

      // ── Error Pages ────────────────────────────────────────
      { path: '500', element: <ServerErrorPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

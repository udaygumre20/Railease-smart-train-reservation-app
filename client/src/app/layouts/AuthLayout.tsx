import { Outlet } from 'react-router';
import { Train } from 'lucide-react';

// ============================================================
// Auth Layout — Centered card for login / register / reset
// ============================================================

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 text-text-inverse">
            <Train className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">RailEase</h1>
          <p className="mt-1 text-sm text-text-secondary">Premium Train Reservation</p>
        </div>

        {/* Auth form slot */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

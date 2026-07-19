import { Outlet } from 'react-router';
import { useAppSelector, useAppDispatch, toggleSidebar, toggleMobileMenu } from '@/app/store';
import { cn } from '@/lib/cn';
import { Menu, X, Train } from 'lucide-react';

// ============================================================
// Dashboard Layout — Sidebar + Header + Content
// ============================================================

export function DashboardLayout() {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const mobileMenuOpen = useAppSelector((s) => s.ui.mobileMenuOpen);

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[var(--z-overlay)] bg-surface-overlay lg:hidden"
          onClick={() => dispatch(toggleMobileMenu())}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[var(--z-overlay)] flex w-64 flex-col border-r border-border bg-surface transition-transform duration-[var(--duration-normal)] ease-[var(--ease-default)] lg:static lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          !sidebarOpen && 'lg:w-20',
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-text-inverse">
            <Train className="h-5 w-5" />
          </div>
          {sidebarOpen && (
            <span className="font-display text-lg font-bold text-text-primary">RailEase</span>
          )}
        </div>

        {/* Sidebar Navigation — populated by feature modules */}
        <nav className="flex-1 overflow-y-auto p-3">
          <p className="px-3 py-2 text-xs text-text-tertiary">
            {sidebarOpen ? 'Navigation ready' : ''}
          </p>
        </nav>
      </aside>

      {/* ── Main Column ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-[var(--z-sticky)] flex h-16 items-center gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur-lg sm:px-6">
          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-lg p-2 text-text-secondary hover:bg-muted lg:hidden"
            onClick={() => dispatch(toggleMobileMenu())}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop sidebar toggle */}
          <button
            type="button"
            className="hidden rounded-lg p-2 text-text-secondary hover:bg-muted lg:block"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />
          {/* User actions will go here */}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

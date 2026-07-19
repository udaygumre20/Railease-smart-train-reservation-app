import { Outlet } from 'react-router';

// ============================================================
// Public Layout — Header + Content + Footer
// ============================================================

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header slot — to be implemented with Header component */}
      <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-surface/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="font-display text-xl font-bold text-primary-600">RailEase</span>
          {/* Navigation links will go here */}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer slot */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-text-secondary sm:px-6 lg:px-8">
          © {new Date().getFullYear()} RailEase. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

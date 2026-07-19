import { Construction } from 'lucide-react';

// ============================================================
// Placeholder Page — used in routes until real screens are built
// ============================================================

export function Component() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="rounded-[var(--radius-2xl)] bg-primary-50 p-4 text-primary-500">
        <Construction className="h-10 w-10" />
      </div>
      <h2 className="font-display text-xl font-semibold text-text-primary">
        Screen Coming Soon
      </h2>
      <p className="max-w-sm text-sm text-text-secondary">
        This page is part of the approved Stitch UI screens and will be implemented next.
      </p>
    </div>
  );
}

Component.displayName = 'PlaceholderPage';

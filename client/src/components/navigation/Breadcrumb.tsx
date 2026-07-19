import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import type { BreadcrumbItem } from '@/types';

// ============================================================
// Breadcrumb — navigation trail
// ============================================================

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      <Link to="/" className="text-text-tertiary transition-colors hover:text-text-primary">
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, idx) => (
        <span key={item.label} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-text-disabled" />
          {item.href && idx < items.length - 1 ? (
            <Link
              to={item.href}
              className="text-text-tertiary transition-colors hover:text-text-primary"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-text-primary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

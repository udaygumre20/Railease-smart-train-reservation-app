import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';

// ============================================================
// PageLoader — in-page content loader
// ============================================================

export interface PageLoaderProps {
  className?: string;
  message?: string;
}

export function PageLoader({ className, message }: PageLoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-20', className)}>
      <Spinner size="lg" />
      {message && <p className="text-sm text-text-secondary">{message}</p>}
    </div>
  );
}

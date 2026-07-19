import { cn } from '@/lib/cn';

// ============================================================
// Skeleton — shimmer placeholder for loading states
// ============================================================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Circle shape for avatar placeholders. */
  circle?: boolean;
}

export function Skeleton({ className, circle, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r from-muted via-surface-elevated to-muted bg-[length:200%_100%]',
        circle ? 'rounded-[var(--radius-full)]' : 'rounded-[var(--radius-md)]',
        className,
      )}
      {...props}
    />
  );
}

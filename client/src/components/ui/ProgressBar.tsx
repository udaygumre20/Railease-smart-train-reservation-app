import { cn } from '@/lib/cn';

// ============================================================
// ProgressBar — determinate / indeterminate progress
// ============================================================

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. Omit for indeterminate. */
  value?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<string, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ProgressBarProps) {
  const isIndeterminate = value === undefined;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'w-full overflow-hidden rounded-[var(--radius-full)] bg-muted',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-[var(--radius-full)] transition-all duration-[var(--duration-slow)]',
          variantClasses[variant],
          isIndeterminate && 'animate-[progress-bar_1.5s_ease-in-out_infinite] w-full',
        )}
        style={!isIndeterminate ? { width: `${Math.min(100, Math.max(0, value))}%` } : undefined}
      />
    </div>
  );
}

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';

// ============================================================
// Checkbox — styled checkbox with label
// ============================================================

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex items-start gap-2', className)}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer h-4 w-4 cursor-pointer appearance-none rounded-[var(--radius-sm)] border border-border bg-surface transition-colors checked:border-primary-600 checked:bg-primary-600 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-[var(--opacity-disabled)]"
            {...props}
          />
          <Check className="pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 text-text-inverse opacity-0 peer-checked:opacity-100" />
        </div>
        {label && (
          <label htmlFor={inputId} className="cursor-pointer text-sm text-text-primary">
            {label}
          </label>
        )}
        {error && <p className="text-xs text-danger-600">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

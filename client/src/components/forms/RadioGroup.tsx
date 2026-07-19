import { cn } from '@/lib/cn';

// ============================================================
// RadioGroup — radio button group
// ============================================================

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  error?: string;
  className?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  orientation = 'vertical',
  error,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div
        role="radiogroup"
        className={cn(
          'flex gap-3',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        )}
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              'inline-flex cursor-pointer items-center gap-2 text-sm text-text-primary',
              opt.disabled && 'cursor-not-allowed opacity-[var(--opacity-disabled)]',
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              disabled={opt.disabled}
              onChange={() => onChange?.(opt.value)}
              className="h-4 w-4 cursor-pointer accent-primary-600 focus-visible:ring-2 focus-visible:ring-ring"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-danger-600">{error}</p>}
    </div>
  );
}

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

// ============================================================
// Tabs — controlled tab navigation
// ============================================================

export interface TabsProps {
  tabs: Array<{
    value: string;
    label: string;
    icon?: ReactNode;
    badge?: number;
  }>;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultValue, value, onChange, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? tabs[0]?.value ?? '');
  const activeValue = value ?? internalValue;

  const handleChange = (v: string) => {
    if (!value) setInternalValue(v);
    onChange?.(v);
  };

  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-1 rounded-[var(--radius-lg)] bg-muted p-1',
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          type="button"
          aria-selected={activeValue === tab.value}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all duration-[var(--duration-fast)]',
            activeValue === tab.value
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary',
          )}
          onClick={() => handleChange(tab.value)}
        >
          {tab.icon}
          {tab.label}
          {tab.badge != null && tab.badge > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-[var(--radius-full)] bg-primary-100 px-1 text-[10px] font-semibold text-primary-700">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

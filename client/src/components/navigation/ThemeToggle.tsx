import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';
import type { ThemeMode } from '@/types';

// ============================================================
// ThemeToggle — cycle through light / dark / system
// ============================================================

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const icons: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const labels: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export function ThemeToggle({ className, showLabel }: ThemeToggleProps) {
  const { mode, setTheme } = useTheme();

  const cycle = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(mode) + 1) % order.length]!;
    setTheme(next);
  };

  const Icon = icons[mode];

  return (
    <button
      type="button"
      onClick={cycle}
      className={cn(
        'inline-flex items-center gap-2 rounded-[var(--radius-lg)] p-2 text-text-secondary transition-colors hover:bg-muted hover:text-text-primary',
        className,
      )}
      aria-label={`Theme: ${labels[mode]}`}
    >
      <Icon className="h-5 w-5" />
      {showLabel && <span className="text-sm">{labels[mode]}</span>}
    </button>
  );
}

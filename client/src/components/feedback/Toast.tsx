import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppSelector, useAppDispatch, removeToast } from '@/app/store';
import type { ToastItem } from '@/app/store';

// ============================================================
// Toast — notification stack
// ============================================================

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const styleMap = {
  success: 'border-success-500/30 bg-success-50 text-success-700',
  error: 'border-danger-500/30 bg-danger-50 text-danger-700',
  warning: 'border-warning-500/30 bg-warning-50 text-warning-700',
  info: 'border-primary-500/30 bg-primary-50 text-primary-700',
} as const;

function ToastMessage({ toast }: { toast: ToastItem }) {
  const dispatch = useAppDispatch();
  const Icon = iconMap[toast.type];

  useEffect(() => {
    const dur = toast.duration ?? 5000;
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), dur);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id, toast.duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      className={cn(
        'flex w-80 items-start gap-3 rounded-[var(--radius-xl)] border p-4 shadow-lg',
        styleMap[toast.type],
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dispatch(removeToast(toast.id))}
        className="shrink-0 rounded-lg p-1 opacity-60 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

/**
 * Render this once at the app root to display toast notifications.
 */
export function ToastContainer() {
  const toasts = useAppSelector((s) => s.ui.toasts);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[var(--z-toast)] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastMessage toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

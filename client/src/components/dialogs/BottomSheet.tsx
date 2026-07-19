import { type ReactNode, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { cn } from '@/lib/cn';

// ============================================================
// BottomSheet — mobile-friendly slide-up panel
// ============================================================

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  /** Height variant. */
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const heightClasses: Record<string, string> = {
  sm: 'max-h-[40vh]',
  md: 'max-h-[60vh]',
  lg: 'max-h-[80vh]',
  full: 'max-h-[95vh]',
};

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
  size = 'md',
}: BottomSheetProps) {
  const controls = useDragControls();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-surface-overlay"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={controls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) onClose();
            }}
            className={cn(
              'relative w-full rounded-t-[var(--radius-2xl)] border-t border-border bg-surface shadow-2xl',
              heightClasses[size],
              className,
            )}
          >
            {/* Drag handle */}
            <div
              className="flex cursor-grab justify-center py-3 active:cursor-grabbing"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="h-1 w-10 rounded-[var(--radius-full)] bg-border" />
            </div>

            {/* Title */}
            {title && (
              <div className="border-b border-border px-5 pb-3">
                <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

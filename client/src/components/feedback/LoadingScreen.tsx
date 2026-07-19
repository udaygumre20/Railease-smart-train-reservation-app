import { motion } from 'framer-motion';
import { Train } from 'lucide-react';

// ============================================================
// LoadingScreen — full-page loading with animated logo
// ============================================================

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className="rounded-2xl bg-primary-500 p-4 text-text-inverse shadow-lg"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <Train className="h-8 w-8" />
        </motion.div>
        <div className="text-center">
          <p className="font-display text-lg font-bold text-text-primary">RailEase</p>
          <p className="text-sm text-text-secondary">Loading your journey…</p>
        </div>
      </motion.div>
    </div>
  );
}

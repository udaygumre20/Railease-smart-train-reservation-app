// ============================================================
// Route Aggregator
// Mounts all feature routes under the /api/v1 prefix.
// New feature routes should be added here as the app grows.
//
// Module routes are imported from src/modules/<module>/index.js
// to keep the routing self-contained per feature module.
// ============================================================

import { Router } from 'express';
import { authRoutes } from '../modules/auth/index.js';
import { trainRoutes } from '../modules/train/index.js';
import { stationRoutes } from '../modules/station/index.js';

const router = Router();

// ── Auth routes (from modular architecture) ─────────────────
router.use('/auth', authRoutes);

// ── Train routes (Phase 4 Part 1) ───────────────────────────
router.use('/trains', trainRoutes);

// ── Station routes (Phase 4 Part 2) ─────────────────────────
router.use('/stations', stationRoutes);

// Future phase routes will be mounted here:
// router.use('/users', userRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/payments', paymentRoutes);

export default router;

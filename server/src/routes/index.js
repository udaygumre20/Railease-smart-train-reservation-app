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

const router = Router();

// ── Auth routes (from modular architecture) ─────────────────
router.use('/auth', authRoutes);

// Future phase routes will be mounted here:
// router.use('/users', userRoutes);
// router.use('/trains', trainRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/stations', stationRoutes);
// router.use('/payments', paymentRoutes);

export default router;

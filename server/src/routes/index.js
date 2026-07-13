// ============================================================
// Route Aggregator
// Mounts all feature routes under the /api/v1 prefix.
// New feature routes should be added here as the app grows.
// ============================================================

import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

// ── Auth routes ─────────────────────────────────────────────
router.use('/auth', authRoutes);

// Future phase routes will be mounted here:
// router.use('/users', userRoutes);
// router.use('/trains', trainRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/stations', stationRoutes);
// router.use('/payments', paymentRoutes);

export default router;

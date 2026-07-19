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
import { routeRoutes } from '../modules/route/index.js';
import { scheduleRoutes } from '../modules/schedule/index.js';
import { bookingRoutes } from '../modules/booking/index.js';
import { paymentRoutes } from '../modules/payment/index.js';
import { ticketRoutes } from '../modules/ticket/index.js';
import { coachPublicRoutes, coachAuthRoutes, coachAdminRoutes } from '../modules/coach/index.js';
import { seatRoutes } from '../modules/seat/index.js';

const router = Router();

// ── Auth routes (from modular architecture) ─────────────────
router.use('/auth', authRoutes);

// ── Train routes (Phase 4 Part 1) ───────────────────────────
router.use('/trains', trainRoutes);

// ── Station routes (Phase 4 Part 2) ─────────────────────────
router.use('/stations', stationRoutes);

// ── Route routes (Phase 4 Part 3) ───────────────────────────
router.use('/routes', routeRoutes);

// ── Schedule routes (Phase 4 Part 4) ────────────────────────
router.use('/schedules', scheduleRoutes);

// ── Coach Engine routes ─────────────────────────────────────
router.use('/', coachPublicRoutes);   // /trains/:trainId/coaches, /coaches/:coachId/*
router.use('/', coachAuthRoutes);     // /seats/recommend
router.use('/admin', coachAdminRoutes); // /admin/coaches, /admin/layout-templates

// ── Seat management routes ──────────────────────────────────
router.use('/seats', seatRoutes);     // /seats/lock, /seats/lock/:lockId, /seats/locks

// Future phase routes will be mounted here:
// router.use('/users', userRoutes);
router.use('/bookings', bookingRoutes);
router.use('/bookings', ticketRoutes); // Mounts /:bookingId/ticket
router.use('/payments', paymentRoutes);

export default router;

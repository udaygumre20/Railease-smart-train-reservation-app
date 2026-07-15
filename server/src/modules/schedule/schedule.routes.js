// ============================================================
// Schedule Routes
// Defines the Express router for /api/v1/schedules endpoints.
// All endpoints are protected by JWT authentication.
// ============================================================

import { Router } from 'express';
import * as scheduleController from './schedule.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import {
  createScheduleSchema,
  updateScheduleSchema,
  scheduleIdParamSchema,
  scheduleQuerySchema,
  seatAvailabilityQuerySchema,
} from './schedule.validation.js';

const router = Router();

// ── PUBLIC ROUTES ───────────────────────────────────────────

router.get(
  '/:id/seat-availability',
  validate({
    params: scheduleIdParamSchema,
    query: seatAvailabilityQuerySchema,
  }),
  scheduleController.getSeatAvailability,
);

// ── PROTECTED ROUTES ────────────────────────────────────────
// All routes below require authentication
router.use(authenticate);

// ── Routes ──────────────────────────────────────────────────
router.post(
  '/',
  validate({ body: createScheduleSchema }),
  scheduleController.createSchedule,
);

router.get(
  '/',
  validate({ query: scheduleQuerySchema }),
  scheduleController.getAllSchedules,
);

router.get(
  '/:id',
  validate({ params: scheduleIdParamSchema }),
  scheduleController.getScheduleById,
);

router.put(
  '/:id',
  validate({ params: scheduleIdParamSchema, body: updateScheduleSchema }),
  scheduleController.updateSchedule,
);

router.delete(
  '/:id',
  validate({ params: scheduleIdParamSchema }),
  scheduleController.deleteSchedule,
);

export default router;

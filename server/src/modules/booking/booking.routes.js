// ============================================================
// Booking Routes
// Defines the Express router for /api/v1/bookings endpoints.
// ============================================================

import { Router } from 'express';
import * as bookingController from './booking.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import {
  createBookingSchema,
  bookingQuerySchema,
  bookingIdParamSchema,
} from './booking.validation.js';

const router = Router();

// ── PROTECTED ROUTES ────────────────────────────────────────
// All booking routes require authentication
router.use(authenticate);

router.post(
  '/',
  validate({ body: createBookingSchema }),
  bookingController.createBooking,
);

router.get(
  '/',
  validate({ query: bookingQuerySchema }),
  bookingController.getMyBookings,
);

router.get(
  '/:bookingId',
  validate({ params: bookingIdParamSchema }),
  bookingController.getBookingById,
);

router.patch(
  '/:bookingId/cancel',
  validate({ params: bookingIdParamSchema }),
  bookingController.cancelBooking,
);

export default router;

import { Router } from 'express';
import * as paymentController from './payment.controller.js';
import * as paymentValidation from './payment.validation.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

// ── Create Payment Order ────────────────────────────────────
router.post(
  '/create-order',
  validate(paymentValidation.createOrderSchema),
  paymentController.createOrder
);

// ── Verify Payment ──────────────────────────────────────────
router.post(
  '/verify',
  validate(paymentValidation.verifyPaymentSchema),
  paymentController.verifyPayment
);

// ── Get Payment By Booking ──────────────────────────────────
router.get(
  '/bookings/:bookingId',
  validate(paymentValidation.paymentParamsSchema),
  paymentController.getPayment
);

export default router;

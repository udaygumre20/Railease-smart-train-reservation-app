// ============================================================
// Seat Routes
// Defines Express router for seat locking endpoints.
//
// Route table:
//  POST   /seats/lock              → Lock seat(s)       (auth)
//  DELETE /seats/lock/:lockId      → Release lock        (auth)
//  GET    /seats/locks             → User's active locks (auth)
//
// All routes require JWT authentication.
// ============================================================

import { Router } from 'express';
import * as seatController from './seat.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import {
  lockSeatSchema,
  lockIdParamSchema,
  userLocksQuerySchema,
} from './seat.validation.js';

const router = Router();

// All seat management routes require authentication
router.use(authenticate);

// Lock seat(s)
router.post(
  '/lock',
  validate({ body: lockSeatSchema }),
  seatController.lockSeats,
);

// Release lock
router.delete(
  '/lock/:lockId',
  validate({ params: lockIdParamSchema }),
  seatController.unlockSeat,
);

// Get user's active locks
router.get(
  '/locks',
  validate({ query: userLocksQuerySchema }),
  seatController.getUserLocks,
);

export default router;

// ============================================================
// Seat Validation Schemas
// Zod schemas for seat lock/unlock endpoints.
// ============================================================

import { z } from 'zod';
import { uuidSchema } from '../../validation/common.validation.js';

// ── LOCK SEAT BODY ──────────────────────────────────────────

export const lockSeatSchema = z.object({
  seatIds: z.union([
    uuidSchema,
    z.array(uuidSchema).min(1, 'At least one seat ID required').max(6, 'Max 6 seats'),
  ]),

  trainId: uuidSchema,

  journeyDate: z
    .string({ required_error: 'Journey date is required' }),
});

// ── LOCK ID PARAM ───────────────────────────────────────────

export const lockIdParamSchema = z.object({
  lockId: uuidSchema,
});

// ── USER LOCKS QUERY ────────────────────────────────────────

export const userLocksQuerySchema = z.object({
  trainId: z
    .string({ required_error: 'Train ID is required' })
    .uuid('Invalid train ID'),
  journeyDate: z
    .string({ required_error: 'Journey date is required' }),
});

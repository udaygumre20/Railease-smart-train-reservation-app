// ============================================================
// Auth Validation Schemas
// Zod schemas for validating authentication request bodies.
// These are consumed by the generic validate middleware
// (src/middleware/validate.middleware.js) which parses req.body
// against the supplied schema.
//
// Note: The actual field-level schemas (email, password, etc.)
// are imported from the shared common.validation.js to prevent
// duplication across modules.
// ============================================================

import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
} from '../../validation/common.validation.js';

// ── REGISTER SCHEMA ─────────────────────────────────────────

/**
 * Validates the POST /register request body.
 *
 * Expected fields:
 *  - firstName (required) – minimum 2 characters
 *  - lastName  (required) – minimum 2 characters
 *  - email     (required) – trimmed, lowercased, format validated
 *  - password  (required) – strength rules enforced
 *  - phone     (required) – Indian phone format
 *
 */
export const registerSchema = z.object({
  firstName: z.string({ required_error: 'First name is required' }).trim().min(2, 'First name must be at least 2 characters'),
  lastName: z.string({ required_error: 'Last name is required' }).trim().min(2, 'Last name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
});
// ── LOGIN SCHEMA ────────────────────────────────────────────

/**
 * Validates the POST /login request body.
 *
 * Expected fields:
 *  - email    (required) – trimmed, lowercased, format validated
 *  - password (required) – only presence check, no strength rules
 *
 * @todo Phase 3 Part 3 – refine constraints if needed.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

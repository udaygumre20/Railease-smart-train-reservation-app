// ============================================================
// Authentication Validation Schemas
// Zod schemas for registration and login request bodies.
// ============================================================

import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  fullNameSchema,
} from './common.validation.js';

/**
 * Registration request body schema.
 *
 * Accepts fullName and splits into firstName/lastName in the service layer.
 */
export const registerSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
});

/**
 * Login request body schema.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

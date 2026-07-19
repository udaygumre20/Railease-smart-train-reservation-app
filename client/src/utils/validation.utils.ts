import { z } from 'zod';

// ============================================================
// Reusable Zod Schemas
// ============================================================

export const emailSchema = z.string().email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number');

export const pnrSchema = z
  .string()
  .regex(/^\d{10}$/, 'PNR must be exactly 10 digits');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be at most 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

/** Confirm password refinement helper. */
export function withConfirmPassword<T extends z.ZodTypeAny>(
  schema: T,
  passwordField = 'password',
  confirmField = 'confirmPassword',
) {
  return schema.refine(
    (data: Record<string, unknown>) => data[passwordField] === data[confirmField],
    { message: 'Passwords do not match', path: [confirmField] },
  );
}

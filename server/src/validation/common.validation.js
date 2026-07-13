// ============================================================
// Common Validation Schemas
// Reusable Zod schemas for shared field types used across
// multiple validation files.
// ============================================================

import { z } from 'zod';

/**
 * Email validation schema.
 */
export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Please provide a valid email address');

/**
 * Password validation schema with strength requirements.
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character'
  );

/**
 * Phone number validation (Indian format).
 * Accepts: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX
 */
export const phoneSchema = z
  .string({ required_error: 'Phone number is required' })
  .trim()
  .regex(
    /^(\+91|91|0)?[6-9]\d{9}$/,
    'Please provide a valid Indian phone number'
  );

/**
 * UUID validation schema.
 */
export const uuidSchema = z
  .string()
  .uuid('Invalid ID format');

/**
 * Full name validation schema.
 */
export const fullNameSchema = z
  .string({ required_error: 'Full name is required' })
  .trim()
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name must not exceed 100 characters');

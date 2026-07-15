// ============================================================
// Booking Validation
// Zod schemas for validating booking requests.
// ============================================================

import { z } from 'zod';

const uuidSchema = z
  .string({ required_error: 'ID is required' })
  .uuid('Invalid UUID format');

const QUOTA_VALUES = [
  'GENERAL',
  'LADIES',
  'TATKAL',
  'PREMIUM_TATKAL',
  'SENIOR_CITIZEN',
  'DIVYAANG',
  'DEFENCE',
  'FOREIGN_TOURIST'
];

const BOOKING_STATUS_VALUES = [
  'PENDING',
  'CONFIRMED',
  'WAITLISTED',
  'RAC',
  'CANCELLED',
  'EXPIRED'
];

// ── SCHEMAS ─────────────────────────────────────────────────

export const createBookingSchema = z.object({
  scheduleId: uuidSchema,
  sourceStationId: uuidSchema,
  destinationStationId: uuidSchema,
  
  travelClass: z.string().min(1, 'Travel class is required'),
  
  journeyDate: z
    .string()
    .date('Journey date must be a valid ISO date string (YYYY-MM-DD)')
    .or(z.string().datetime('Journey date must be a valid ISO date string')),

  quota: z
    .enum(QUOTA_VALUES, {
      errorMap: () => ({ message: `Quota must be one of: ${QUOTA_VALUES.join(', ')}` })
    })
    .optional(),

  passengers: z
    .array(
      z.object({
        firstName: z.string().min(2, 'First name must be at least 2 characters'),
        lastName: z.string().min(1, 'Last name is required'),
        age: z.number().int().min(1, 'Age must be at least 1').max(120, 'Age is too high'),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
        nationality: z.string().optional(),
        idType: z.string().optional(),
        idNumber: z.string().optional(),
        seatPreference: z.enum(['LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER']).optional(),
        isLeadPassenger: z.boolean().optional(),
      })
    )
    .min(1, 'At least one passenger is required')
    .max(6, 'Maximum 6 passengers allowed per booking'),
});

export const bookingQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
  status: z
    .enum(BOOKING_STATUS_VALUES, {
      errorMap: () => ({ message: `Status must be one of: ${BOOKING_STATUS_VALUES.join(', ')}` })
    })
    .optional(),
  journeyDate: z
    .string()
    .date('Journey date must be a valid ISO date string (YYYY-MM-DD)')
    .or(z.string().datetime('Journey date must be a valid ISO date string'))
    .optional(),
  sortBy: z.enum(['bookingDate', 'journeyDate', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const bookingIdParamSchema = z.object({
  bookingId: uuidSchema,
});

// ============================================================
// Coach Validation Schemas
// Zod schemas for validating coach request bodies, route
// params, and query strings.
// ============================================================

import { z } from 'zod';
import { uuidSchema } from '../../validation/common.validation.js';

// ── Enum values ─────────────────────────────────────────────
const COACH_CLASS_VALUES = ['EC', 'CC', 'SL', 'AC3', 'AC2', 'AC1'];
const COACH_TECH_VALUES = ['LHB', 'ICF', 'VANDE_BHARAT'];
const LAYOUT_TYPE_VALUES = ['CHAIR_2_2', 'CHAIR_2_3', 'SLEEPER_3_TIER', 'AC_3_TIER', 'AC_2_TIER', 'FIRST_AC'];
const SEAT_PREFERENCES = ['WINDOW', 'LOWER_BERTH', 'TOGETHER', 'NEAR_EXIT', 'NEAR_WASHROOM', 'SENIOR_CITIZEN', 'ACCESSIBLE'];

// ── COACH ID PARAM ──────────────────────────────────────────

export const coachIdParamSchema = z.object({
  coachId: uuidSchema,
});

// ── TRAIN ID PARAM (for coaches-by-train) ───────────────────

export const trainIdParamSchema = z.object({
  trainId: uuidSchema,
});

// ── LAYOUT TYPE PARAM ───────────────────────────────────────

export const layoutTypeParamSchema = z.object({
  layoutType: z.enum(LAYOUT_TYPE_VALUES, {
    errorMap: () => ({
      message: `Layout type must be one of: ${LAYOUT_TYPE_VALUES.join(', ')}`,
    }),
  }),
});

// ── SEAT MAP QUERY ──────────────────────────────────────────

export const seatMapQuerySchema = z.object({
  trainId: z.string().uuid('Invalid train ID').optional(),
  journeyDate: z
    .string()
    .optional(),
});

// ── AVAILABILITY QUERY ──────────────────────────────────────

export const availabilityQuerySchema = z.object({
  trainId: z
    .string({ required_error: 'Train ID is required' })
    .uuid('Invalid train ID'),
  journeyDate: z
    .string({ required_error: 'Journey date is required' }),
});

// ── CREATE COACH (ADMIN) ────────────────────────────────────

export const createCoachSchema = z.object({
  coachNumber: z
    .string({ required_error: 'Coach number is required' })
    .trim()
    .min(1, 'Coach number is required')
    .max(10, 'Coach number must not exceed 10 characters'),

  trainId: uuidSchema,

  coachTypeId: uuidSchema,

  sequence: z
    .number({ required_error: 'Sequence is required' })
    .int('Sequence must be an integer')
    .min(1, 'Sequence must be at least 1'),
});

// ── UPDATE COACH (ADMIN) ────────────────────────────────────

export const updateCoachSchema = z
  .object({
    coachNumber: z.string().trim().min(1).max(10).optional(),
    sequence: z.number().int().min(1).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// ── RECOMMENDATION BODY ────────────────────────────────────

export const recommendationSchema = z.object({
  coachId: uuidSchema,

  trainId: uuidSchema,

  journeyDate: z
    .string({ required_error: 'Journey date is required' }),

  passengerCount: z
    .number({ required_error: 'Passenger count is required' })
    .int('Passenger count must be an integer')
    .min(1, 'At least 1 passenger required')
    .max(6, 'Maximum 6 passengers allowed'),

  preferences: z
    .array(
      z.enum(SEAT_PREFERENCES, {
        errorMap: () => ({
          message: `Preference must be one of: ${SEAT_PREFERENCES.join(', ')}`,
        }),
      })
    )
    .optional()
    .default([]),
});

// ── CREATE LAYOUT TEMPLATE (ADMIN) ──────────────────────────

export const createLayoutTemplateSchema = z.object({
  layoutType: z.enum(LAYOUT_TYPE_VALUES, {
    errorMap: () => ({
      message: `Layout type must be one of: ${LAYOUT_TYPE_VALUES.join(', ')}`,
    }),
  }),

  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),

  totalRows: z.number().int().min(1),
  totalColumns: z.number().int().min(1),
  totalSeats: z.number().int().min(1),

  seatDefinitions: z.any(), // JSON object validated at service level

  isActive: z.boolean().optional().default(true),
});

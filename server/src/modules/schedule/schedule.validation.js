// ============================================================
// Schedule Validation Schemas
// Zod schemas for parsing and validating schedule requests.
// ============================================================

import { z } from 'zod';
import { uuidSchema } from '../../validation/common.validation.js';

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const SCHEDULE_SORT_FIELDS = ['createdAt', 'updatedAt', 'effectiveFrom'];

// ── CREATE SCHEDULE SCHEMA ──────────────────────────────────

export const createScheduleSchema = z.object({
  trainId: uuidSchema,
  routeId: uuidSchema,
  
  runDays: z
    .array(z.enum(DAYS_OF_WEEK))
    .min(1, 'At least one run day must be specified')
    .max(7, 'Cannot exceed 7 days in a week'),
    
  effectiveFrom: z
    .string()
    .datetime({ message: 'Departure Date & Time (effectiveFrom) must be a valid ISO-8601 DateTime string' }),
    
  effectiveTo: z
    .string()
    .datetime({ message: 'Arrival Date & Time (effectiveTo) must be a valid ISO-8601 DateTime string' })
    .optional()
    .nullable(),
});

// ── UPDATE SCHEDULE SCHEMA ──────────────────────────────────

export const updateScheduleSchema = z.object({
  trainId: uuidSchema.optional(),
  routeId: uuidSchema.optional(),
  
  runDays: z
    .array(z.enum(DAYS_OF_WEEK))
    .min(1, 'At least one run day must be specified')
    .max(7, 'Cannot exceed 7 days in a week')
    .optional(),
    
  effectiveFrom: z
    .string()
    .datetime({ message: 'Departure Date & Time (effectiveFrom) must be a valid ISO-8601 DateTime string' })
    .optional(),
    
  effectiveTo: z
    .string()
    .datetime({ message: 'Arrival Date & Time (effectiveTo) must be a valid ISO-8601 DateTime string' })
    .optional()
    .nullable(),
    
  isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// ── SCHEDULE ID PARAM SCHEMA ────────────────────────────────

export const scheduleIdParamSchema = z.object({
  id: uuidSchema,
});

// ── SCHEDULE QUERY SCHEMA ───────────────────────────────────

export const scheduleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  
  trainId: uuidSchema.optional(),
  routeId: uuidSchema.optional(),
  
  sortBy: z
    .enum(SCHEDULE_SORT_FIELDS, {
      errorMap: () => ({ message: `Sort field must be one of: ${SCHEDULE_SORT_FIELDS.join(', ')}` }),
    })
    .optional()
    .default('createdAt'),

  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),

  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

// ── SEAT AVAILABILITY QUERY SCHEMA (PHASE 4 PART 6) ─────────

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

export const seatAvailabilityQuerySchema = z.object({
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
});

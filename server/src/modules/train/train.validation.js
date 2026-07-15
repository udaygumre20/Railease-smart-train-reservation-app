// ============================================================
// Train Validation Schemas
// Zod schemas for validating train request bodies, route
// params, and query strings.
//
// Consumed by the generic validate middleware:
//   validate({ body: createTrainSchema })
//   validate({ params: trainIdParamSchema })
//   validate({ params: trainIdParamSchema, query: trainQuerySchema })
// ============================================================

import { z } from 'zod';
import { uuidSchema } from '../../validation/common.validation.js';

// ── Allowed values from Prisma TrainStatus enum ─────────────
const TRAIN_STATUS_VALUES = ['ACTIVE', 'CANCELLED', 'SUSPENDED'];

// ── Allowed sort fields for train listing ───────────────────
const TRAIN_SORT_FIELDS = ['trainNumber', 'name', 'status', 'createdAt', 'updatedAt'];

// ── CREATE TRAIN SCHEMA ─────────────────────────────────────

/**
 * Validates the POST /trains request body.
 *
 * Required: trainNumber, name
 * Optional: status (defaults to ACTIVE)
 */
export const createTrainSchema = z.object({
  trainNumber: z
    .string({ required_error: 'Train number is required' })
    .trim()
    .min(1, 'Train number is required')
    .max(10, 'Train number must not exceed 10 characters'),

  name: z
    .string({ required_error: 'Train name is required' })
    .trim()
    .min(2, 'Train name must be at least 2 characters')
    .max(100, 'Train name must not exceed 100 characters'),

  status: z
    .enum(TRAIN_STATUS_VALUES, {
      errorMap: () => ({
        message: `Status must be one of: ${TRAIN_STATUS_VALUES.join(', ')}`,
      }),
    })
    .optional()
    .default('ACTIVE'),
});

// ── UPDATE TRAIN SCHEMA ─────────────────────────────────────

/**
 * Validates the PUT /trains/:id request body.
 * All fields are optional, but at least one must be provided.
 */
export const updateTrainSchema = z
  .object({
    trainNumber: z
      .string()
      .trim()
      .min(1, 'Train number cannot be empty')
      .max(10, 'Train number must not exceed 10 characters')
      .optional(),

    name: z
      .string()
      .trim()
      .min(2, 'Train name must be at least 2 characters')
      .max(100, 'Train name must not exceed 100 characters')
      .optional(),

    status: z
      .enum(TRAIN_STATUS_VALUES, {
        errorMap: () => ({
          message: `Status must be one of: ${TRAIN_STATUS_VALUES.join(', ')}`,
        }),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// ── TRAIN ID PARAM SCHEMA ───────────────────────────────────

/**
 * Validates the :id route parameter as a valid UUID.
 */
export const trainIdParamSchema = z.object({
  id: uuidSchema,
});

// ── TRAIN QUERY SCHEMA ──────────────────────────────────────

/**
 * Validates and coerces query parameters for GET /trains.
 * Provides sensible defaults for pagination and sorting.
 */
export const trainQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .optional()
    .default(1),

  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .optional()
    .default(10),

  search: z
    .string()
    .trim()
    .max(100, 'Search term must not exceed 100 characters')
    .optional(),

  sortBy: z
    .enum(TRAIN_SORT_FIELDS, {
      errorMap: () => ({
        message: `Sort field must be one of: ${TRAIN_SORT_FIELDS.join(', ')}`,
      }),
    })
    .optional()
    .default('createdAt'),

  sortOrder: z
    .enum(['asc', 'desc'], {
      errorMap: () => ({
        message: 'Sort order must be either asc or desc',
      }),
    })
    .optional()
    .default('desc'),
});

// ── TRAIN SEARCH QUERY SCHEMA (PHASE 4 PART 5) ──────────────

export const searchTrainsQuerySchema = z.object({
  sourceStationId: uuidSchema,
  destinationStationId: uuidSchema,
  
  journeyDate: z
    .string()
    .date('Journey date must be a valid ISO date string (YYYY-MM-DD)')
    .or(z.string().datetime('Journey date must be a valid ISO date string')),

  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),

  sortBy: z
    .enum(['departureTime', 'duration', 'trainName'], {
      errorMap: () => ({ message: 'Sort field must be one of: departureTime, duration, trainName' })
    })
    .optional()
    .default('departureTime'),

  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('asc'),
});

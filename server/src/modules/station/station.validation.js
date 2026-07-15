// ============================================================
// Station Validation Schemas
// Zod schemas for validating station request bodies, route
// params, and query strings.
// ============================================================

import { z } from 'zod';
import { uuidSchema } from '../../validation/common.validation.js';

// ── Allowed sort fields for station listing ─────────────────
const STATION_SORT_FIELDS = ['code', 'name', 'city', 'state', 'platforms', 'createdAt', 'updatedAt'];

// ── CREATE STATION SCHEMA ───────────────────────────────────

/**
 * Validates the POST /stations request body.
 *
 * Required: code, name, city, state
 * Optional: zone, latitude, longitude, platforms
 */
export const createStationSchema = z.object({
  code: z
    .string({ required_error: 'Station code is required' })
    .trim()
    .min(2, 'Station code must be at least 2 characters')
    .max(10, 'Station code must not exceed 10 characters')
    .toUpperCase(),

  name: z
    .string({ required_error: 'Station name is required' })
    .trim()
    .min(2, 'Station name must be at least 2 characters')
    .max(100, 'Station name must not exceed 100 characters'),

  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters'),

  state: z
    .string({ required_error: 'State is required' })
    .trim()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must not exceed 100 characters'),

  zone: z
    .string()
    .trim()
    .max(50, 'Zone must not exceed 50 characters')
    .optional()
    .nullable(),

  latitude: z.coerce
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional()
    .nullable(),

  longitude: z.coerce
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional()
    .nullable(),

  platforms: z.coerce
    .number()
    .int('Platforms must be an integer')
    .min(1, 'Platforms must be at least 1')
    .optional()
    .default(1),
});

// ── UPDATE STATION SCHEMA ───────────────────────────────────

/**
 * Validates the PUT /stations/:id request body.
 * All fields are optional, but at least one must be provided.
 */
export const updateStationSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, 'Station code must be at least 2 characters')
      .max(10, 'Station code must not exceed 10 characters')
      .toUpperCase()
      .optional(),

    name: z
      .string()
      .trim()
      .min(2, 'Station name must be at least 2 characters')
      .max(100, 'Station name must not exceed 100 characters')
      .optional(),

    city: z
      .string()
      .trim()
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City must not exceed 100 characters')
      .optional(),

    state: z
      .string()
      .trim()
      .min(2, 'State must be at least 2 characters')
      .max(100, 'State must not exceed 100 characters')
      .optional(),

    zone: z
      .string()
      .trim()
      .max(50, 'Zone must not exceed 50 characters')
      .optional()
      .nullable(),

    latitude: z.coerce
      .number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90')
      .optional()
      .nullable(),

    longitude: z.coerce
      .number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180')
      .optional()
      .nullable(),

    platforms: z.coerce
      .number()
      .int('Platforms must be an integer')
      .min(1, 'Platforms must be at least 1')
      .optional(),

    isActive: z
      .boolean()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// ── STATION ID PARAM SCHEMA ─────────────────────────────────

/**
 * Validates the :id route parameter as a valid UUID.
 */
export const stationIdParamSchema = z.object({
  id: uuidSchema,
});

// ── STATION QUERY SCHEMA ────────────────────────────────────

/**
 * Validates and coerces query parameters for GET /stations.
 * Provides sensible defaults for pagination and sorting.
 */
export const stationQuerySchema = z.object({
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
    .enum(STATION_SORT_FIELDS, {
      errorMap: () => ({
        message: `Sort field must be one of: ${STATION_SORT_FIELDS.join(', ')}`,
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

  isActive: z
    .enum(['true', 'false'], {
      errorMap: () => ({
        message: 'isActive must be either true or false',
      }),
    })
    .transform((val) => val === 'true')
    .optional(),
});

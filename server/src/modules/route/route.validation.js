// ============================================================
// Route Validation Schemas
// Zod schemas for validating route request bodies, route
// params, and query strings. Handles nested RouteStop arrays.
// ============================================================

import { z } from 'zod';
import { uuidSchema } from '../../validation/common.validation.js';

// ── Allowed sort fields for route listing ───────────────────
const ROUTE_SORT_FIELDS = ['code', 'name', 'totalDistance', 'createdAt', 'updatedAt'];

// ── ROUTE STOP SCHEMA (NESTED) ──────────────────────────────
/**
 * Schema for a single stop in a route.
 */
const routeStopSchema = z.object({
  stationId: uuidSchema,
  
  sequenceNumber: z.coerce
    .number()
    .int('Sequence number must be an integer')
    .min(1, 'Sequence number must be at least 1'),
    
  distanceFromOrigin: z.coerce
    .number()
    .min(0, 'Distance cannot be negative'),
    
  arrivalTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Arrival time must be in HH:MM format')
    .optional()
    .nullable(),
    
  departureTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Departure time must be in HH:MM format')
    .optional()
    .nullable(),
    
  haltDuration: z.coerce
    .number()
    .int('Halt duration must be an integer in minutes')
    .min(0, 'Halt duration cannot be negative')
    .optional()
    .nullable(),
    
  dayOffset: z.coerce
    .number()
    .int('Day offset must be an integer')
    .min(0, 'Day offset cannot be negative')
    .optional()
    .default(0),
    
  platform: z.coerce
    .number()
    .int('Platform must be an integer')
    .min(1, 'Platform must be at least 1')
    .optional()
    .nullable(),
});

// ── CREATE ROUTE SCHEMA ─────────────────────────────────────

/**
 * Validates the POST /routes request body.
 * 
 * Required: name, code, totalDistance, stops[] (at least 2 stops: src/dest)
 */
export const createRouteSchema = z.object({
  name: z
    .string({ required_error: 'Route name is required' })
    .trim()
    .min(2, 'Route name must be at least 2 characters')
    .max(100, 'Route name must not exceed 100 characters'),
    
  code: z
    .string({ required_error: 'Route code is required' })
    .trim()
    .min(2, 'Route code must be at least 2 characters')
    .max(20, 'Route code must not exceed 20 characters')
    .toUpperCase(),
    
  totalDistance: z.coerce
    .number({ required_error: 'Total distance is required' })
    .min(0, 'Total distance must be positive'),
    
  stops: z
    .array(routeStopSchema, { required_error: 'Stops are required' })
    .min(2, 'A route must have at least 2 stops (source and destination)'),
});

// ── UPDATE ROUTE SCHEMA ─────────────────────────────────────

/**
 * Validates the PUT /routes/:id request body.
 * All fields optional. If stops provided, must have at least 2.
 */
export const updateRouteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Route name must be at least 2 characters')
    .max(100, 'Route name must not exceed 100 characters')
    .optional(),
    
  code: z
    .string()
    .trim()
    .min(2, 'Route code must be at least 2 characters')
    .max(20, 'Route code must not exceed 20 characters')
    .toUpperCase()
    .optional(),
    
  totalDistance: z.coerce
    .number()
    .min(0, 'Total distance must be positive')
    .optional(),
    
  stops: z
    .array(routeStopSchema)
    .min(2, 'A route must have at least 2 stops (source and destination)')
    .optional(),
    
  isActive: z
    .boolean()
    .optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// ── ROUTE ID PARAM SCHEMA ───────────────────────────────────

export const routeIdParamSchema = z.object({
  id: uuidSchema,
});

// ── ROUTE QUERY SCHEMA ──────────────────────────────────────

/**
 * Validates query params for GET /routes.
 */
export const routeQuerySchema = z.object({
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
    
  stationId: uuidSchema.optional(),

  sortBy: z
    .enum(ROUTE_SORT_FIELDS, {
      errorMap: () => ({
        message: `Sort field must be one of: ${ROUTE_SORT_FIELDS.join(', ')}`,
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

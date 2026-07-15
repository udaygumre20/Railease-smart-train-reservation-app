// ============================================================
// Route Controller
// Thin HTTP layer for route management endpoints.
// Responsibilities:
//  • Parse incoming request data (body, params, query)
//  • Delegate to route.service for all business logic
//  • Format and send responses via response helpers
//
// Rule: NO business logic here – keep controllers thin.
// ============================================================

import * as routeService from './route.service.js';
import { sendSuccess, sendCreated } from '../../helpers/response.helper.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── CREATE ROUTE ────────────────────────────────────────────

/**
 * POST /api/v1/routes
 * Create a new route with its nested stops.
 */
export const createRoute = asyncHandler(async (req, res) => {
  const route = await routeService.createRoute(req.body);

  return sendCreated(res, {
    message: 'Route created successfully',
    data: { route },
  });
});

// ── GET ALL ROUTES ──────────────────────────────────────────

/**
 * GET /api/v1/routes
 * Retrieve a paginated list of routes with search, sorting,
 * and optional filtering by stationId.
 */
export const getAllRoutes = asyncHandler(async (req, res) => {
  const result = await routeService.getAllRoutes(req.query);

  return sendSuccess(res, {
    message: 'Routes retrieved successfully',
    data: {
      routes: result.routes,
      pagination: result.pagination,
    },
  });
});

// ── GET ROUTE BY ID ─────────────────────────────────────────

/**
 * GET /api/v1/routes/:id
 * Retrieve a single route by its UUID, including stops.
 */
export const getRouteById = asyncHandler(async (req, res) => {
  const route = await routeService.getRouteById(req.params.id);

  return sendSuccess(res, {
    message: 'Route retrieved successfully',
    data: { route },
  });
});

// ── UPDATE ROUTE ────────────────────────────────────────────

/**
 * PUT /api/v1/routes/:id
 * Update an existing route record. If stops are provided,
 * they will replace the existing stops.
 */
export const updateRoute = asyncHandler(async (req, res) => {
  const route = await routeService.updateRoute(req.params.id, req.body);

  return sendSuccess(res, {
    message: 'Route updated successfully',
    data: { route },
  });
});

// ── DELETE ROUTE ────────────────────────────────────────────

/**
 * DELETE /api/v1/routes/:id
 * Soft-delete a route (sets isActive to false).
 */
export const deleteRoute = asyncHandler(async (req, res) => {
  const route = await routeService.deleteRoute(req.params.id);

  return sendSuccess(res, {
    message: 'Route deactivated successfully',
    data: { route },
  });
});

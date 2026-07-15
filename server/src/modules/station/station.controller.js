// ============================================================
// Station Controller
// Thin HTTP layer for station management endpoints.
// Responsibilities:
//  • Parse incoming request data (body, params, query)
//  • Delegate to station.service for all business logic
//  • Format and send responses via response helpers
//
// Rule: NO business logic here – keep controllers thin.
// ============================================================

import * as stationService from './station.service.js';
import { sendSuccess, sendCreated } from '../../helpers/response.helper.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── CREATE STATION ──────────────────────────────────────────

/**
 * POST /api/v1/stations
 * Create a new station record.
 */
export const createStation = asyncHandler(async (req, res) => {
  const station = await stationService.createStation(req.body);

  return sendCreated(res, {
    message: 'Station created successfully',
    data: { station },
  });
});

// ── GET ALL STATIONS ────────────────────────────────────────

/**
 * GET /api/v1/stations
 * Retrieve a paginated list of stations with search and sort.
 */
export const getAllStations = asyncHandler(async (req, res) => {
  const result = await stationService.getAllStations(req.query);

  return sendSuccess(res, {
    message: 'Stations retrieved successfully',
    data: {
      stations: result.stations,
      pagination: result.pagination,
    },
  });
});

// ── GET STATION BY ID ───────────────────────────────────────

/**
 * GET /api/v1/stations/:id
 * Retrieve a single station by its UUID.
 */
export const getStationById = asyncHandler(async (req, res) => {
  const station = await stationService.getStationById(req.params.id);

  return sendSuccess(res, {
    message: 'Station retrieved successfully',
    data: { station },
  });
});

// ── UPDATE STATION ──────────────────────────────────────────

/**
 * PUT /api/v1/stations/:id
 * Update an existing station record.
 */
export const updateStation = asyncHandler(async (req, res) => {
  const station = await stationService.updateStation(req.params.id, req.body);

  return sendSuccess(res, {
    message: 'Station updated successfully',
    data: { station },
  });
});

// ── DELETE STATION ──────────────────────────────────────────

/**
 * DELETE /api/v1/stations/:id
 * Soft-delete a station (sets isActive to false).
 */
export const deleteStation = asyncHandler(async (req, res) => {
  const station = await stationService.deleteStation(req.params.id);

  return sendSuccess(res, {
    message: 'Station deactivated successfully',
    data: { station },
  });
});

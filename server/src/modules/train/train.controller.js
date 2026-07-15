// ============================================================
// Train Controller
// Thin HTTP layer for train management endpoints.
// Responsibilities:
//  • Parse incoming request data (body, params, query)
//  • Delegate to train.service for all business logic
//  • Format and send responses via response helpers
//
// Rule: NO business logic here – keep controllers thin.
// ============================================================

import * as trainService from './train.service.js';
import { sendSuccess, sendCreated } from '../../helpers/response.helper.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── CREATE TRAIN ────────────────────────────────────────────

/**
 * POST /api/v1/trains
 * Create a new train record.
 */
export const createTrain = asyncHandler(async (req, res) => {
  const train = await trainService.createTrain(req.body);

  return sendCreated(res, {
    message: 'Train created successfully',
    data: { train },
  });
});

// ── GET ALL TRAINS ──────────────────────────────────────────

/**
 * GET /api/v1/trains
 * Retrieve a paginated list of trains with search and sort.
 */
export const getAllTrains = asyncHandler(async (req, res) => {
  const result = await trainService.getAllTrains(req.query);

  return sendSuccess(res, {
    message: 'Trains retrieved successfully',
    data: {
      trains: result.trains,
      pagination: result.pagination,
    },
  });
});

// ── GET TRAIN BY ID ─────────────────────────────────────────

/**
 * GET /api/v1/trains/:id
 * Retrieve a single train by its UUID.
 */
export const getTrainById = asyncHandler(async (req, res) => {
  const train = await trainService.getTrainById(req.params.id);

  return sendSuccess(res, {
    message: 'Train retrieved successfully',
    data: { train },
  });
});

// ── UPDATE TRAIN ────────────────────────────────────────────

/**
 * PUT /api/v1/trains/:id
 * Update an existing train record.
 */
export const updateTrain = asyncHandler(async (req, res) => {
  const train = await trainService.updateTrain(req.params.id, req.body);

  return sendSuccess(res, {
    message: 'Train updated successfully',
    data: { train },
  });
});

// ── DELETE TRAIN ────────────────────────────────────────────

/**
 * DELETE /api/v1/trains/:id
 * Permanently delete a train record.
 */
export const deleteTrain = asyncHandler(async (req, res) => {
  const train = await trainService.deleteTrain(req.params.id);

  return sendSuccess(res, {
    message: 'Train deleted successfully',
    data: { train },
  });
});

// ── SEARCH TRAINS (PHASE 4 PART 5) ──────────────────────────

/**
 * GET /api/v1/trains/search
 * Public endpoint to search for trains between two stations on a specific date.
 */
export const searchTrains = asyncHandler(async (req, res) => {
  const result = await trainService.searchTrains(req.query);

  return sendSuccess(res, {
    message: 'Train search completed successfully',
    data: {
      trains: result.trains,
      pagination: result.pagination,
    },
  });
});

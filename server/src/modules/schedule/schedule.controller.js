// ============================================================
// Schedule Controller
// Thin HTTP layer for Schedule management endpoints.
// Delegates business logic to schedule.service.
// ============================================================

import * as scheduleService from './schedule.service.js';
import { sendSuccess, sendCreated } from '../../helpers/response.helper.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── CREATE SCHEDULE ─────────────────────────────────────────

/**
 * POST /api/v1/schedules
 */
export const createSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.createSchedule(req.body);

  return sendCreated(res, {
    message: 'Schedule created successfully',
    data: { schedule },
  });
});

// ── GET ALL SCHEDULES ───────────────────────────────────────

/**
 * GET /api/v1/schedules
 */
export const getAllSchedules = asyncHandler(async (req, res) => {
  const result = await scheduleService.getAllSchedules(req.query);

  return sendSuccess(res, {
    message: 'Schedules retrieved successfully',
    data: {
      schedules: result.schedules,
      pagination: result.pagination,
    },
  });
});

// ── GET SCHEDULE BY ID ──────────────────────────────────────

/**
 * GET /api/v1/schedules/:id
 */
export const getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.getScheduleById(req.params.id);

  return sendSuccess(res, {
    message: 'Schedule retrieved successfully',
    data: { schedule },
  });
});

// ── UPDATE SCHEDULE ─────────────────────────────────────────

/**
 * PUT /api/v1/schedules/:id
 */
export const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.updateSchedule(req.params.id, req.body);

  return sendSuccess(res, {
    message: 'Schedule updated successfully',
    data: { schedule },
  });
});

// ── DELETE SCHEDULE ─────────────────────────────────────────

/**
 * DELETE /api/v1/schedules/:id
 */
export const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.deleteSchedule(req.params.id);

  return sendSuccess(res, {
    message: 'Schedule deactivated successfully',
    data: { schedule },
  });
});

// ── SEAT AVAILABILITY (PHASE 4 PART 6) ──────────────────────

/**
 * GET /api/v1/schedules/:id/seat-availability
 */
export const getSeatAvailability = asyncHandler(async (req, res) => {
  const data = await scheduleService.checkSeatAvailability(req.params.id, req.query);

  return sendSuccess(res, {
    message: 'Seat availability fetched successfully',
    data,
  });
});

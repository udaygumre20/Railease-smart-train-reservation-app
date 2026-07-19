// ============================================================
// Coach Controller
// HTTP layer for coach-related endpoints.
// Delegates to coach.service.js for all business logic.
// ============================================================

import * as coachService from './coach.service.js';

// ── GET COACHES FOR TRAIN ──────────────────────────────────

/**
 * GET /api/v1/trains/:trainId/coaches
 */
export const getCoachesByTrain = async (req, res, next) => {
  try {
    const { trainId } = req.params;
    const coaches = await coachService.getCoachesByTrainId(trainId);

    res.status(200).json({
      success: true,
      data: { trainId, coaches },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET COACH DETAILS ──────────────────────────────────────

/**
 * GET /api/v1/coaches/:coachId
 */
export const getCoachDetails = async (req, res, next) => {
  try {
    const { coachId } = req.params;
    const coach = await coachService.getCoachById(coachId);

    res.status(200).json({
      success: true,
      data: coach,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SEAT MAP ───────────────────────────────────────────

/**
 * GET /api/v1/coaches/:coachId/seat-map
 * Query: ?trainId=...&journeyDate=...
 */
export const getSeatMap = async (req, res, next) => {
  try {
    const { coachId } = req.params;
    const { trainId, journeyDate } = req.query;

    const seatMap = await coachService.getSeatMap(coachId, { trainId, journeyDate });

    res.status(200).json({
      success: true,
      data: seatMap,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SEAT AVAILABILITY ──────────────────────────────────

/**
 * GET /api/v1/coaches/:coachId/availability
 * Query: ?trainId=...&journeyDate=...
 */
export const getSeatAvailability = async (req, res, next) => {
  try {
    const { coachId } = req.params;
    const { trainId, journeyDate } = req.query;

    const availability = await coachService.getSeatAvailability(coachId, trainId, journeyDate);

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

// ── SMART SEAT RECOMMENDATION ──────────────────────────────

/**
 * POST /api/v1/seats/recommend
 * Body: { coachId, trainId, journeyDate, passengerCount, preferences }
 */
export const getRecommendations = async (req, res, next) => {
  try {
    const result = await coachService.getRecommendations(req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ── CREATE COACH (ADMIN) ───────────────────────────────────

/**
 * POST /api/v1/admin/coaches
 */
export const createCoach = async (req, res, next) => {
  try {
    const coach = await coachService.createCoach(req.body);

    res.status(201).json({
      success: true,
      message: 'Coach created successfully',
      data: coach,
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE COACH (ADMIN) ───────────────────────────────────

/**
 * PUT /api/v1/admin/coaches/:coachId
 */
export const updateCoach = async (req, res, next) => {
  try {
    const { coachId } = req.params;
    const coach = await coachService.updateCoach(coachId, req.body);

    res.status(200).json({
      success: true,
      message: 'Coach updated successfully',
      data: coach,
    });
  } catch (error) {
    next(error);
  }
};

// ── LAYOUT TEMPLATE OPERATIONS ─────────────────────────────

/**
 * GET /api/v1/admin/layout-templates
 */
export const getAllLayoutTemplates = async (req, res, next) => {
  try {
    const templates = await coachService.getAllLayoutTemplates();

    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/layout-templates/:layoutType
 */
export const getLayoutTemplateByType = async (req, res, next) => {
  try {
    const { layoutType } = req.params;
    const template = await coachService.getLayoutTemplateByType(layoutType);

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/layout-templates
 */
export const createLayoutTemplate = async (req, res, next) => {
  try {
    const template = await coachService.upsertLayoutTemplate(req.body);

    res.status(201).json({
      success: true,
      message: 'Layout template saved successfully',
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

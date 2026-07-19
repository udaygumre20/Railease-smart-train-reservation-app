// ============================================================
// Coach Service
// Business-logic layer for coach management and seat map
// operations. Orchestrates between the coach repository,
// seat renderer, and recommendation engine.
//
// Rules:
//  • No direct Prisma access – use coach.repository.js
//  • No HTTP concepts (req/res) – those stay in controllers
//  • Throw custom error classes for error conditions
// ============================================================

import * as coachRepository from './coach.repository.js';
import { renderSeatMap } from './seatRenderer.js';
import { recommendSeats } from './seatRecommendation.js';
import { generateSeatDefinitions } from './layoutConfigs.js';
import { ConflictError, NotFoundError, ValidationError } from '../../errors/index.js';

// ── GET COACHES FOR TRAIN ──────────────────────────────────

/**
 * List all coaches for a train, ordered by sequence.
 *
 * @param {string} trainId
 * @returns {Promise<object[]>}
 * @throws {NotFoundError} If the train has no coaches
 */
export const getCoachesByTrainId = async (trainId) => {
  const coaches = await coachRepository.findCoachesByTrainId(trainId);

  return coaches.map((coach) => ({
    id: coach.id,
    coachNumber: coach.coachNumber,
    sequence: coach.sequence,
    totalSeats: coach.totalSeats,
    isActive: coach.isActive,
    coachType: {
      id: coach.coachType.id,
      code: coach.coachType.code,
      name: coach.coachType.name,
      coachClass: coach.coachType.coachClass,
      technology: coach.coachType.technology,
      layoutType: coach.coachType.layoutType,
      hasAC: coach.coachType.hasAC,
      baseFarePerKm: coach.coachType.baseFarePerKm,
    },
  }));
};

// ── GET COACH DETAILS ──────────────────────────────────────

/**
 * Get detailed information for a single coach.
 *
 * @param {string} coachId
 * @returns {Promise<object>}
 * @throws {NotFoundError} If the coach does not exist
 */
export const getCoachById = async (coachId) => {
  const coach = await coachRepository.findCoachById(coachId, { includeSeats: true });

  if (!coach) {
    throw new NotFoundError('Coach not found');
  }

  return coach;
};

// ── GET SEAT MAP ───────────────────────────────────────────

/**
 * Generate the seat map (2D grid) for a coach.
 * Optionally includes per-journey availability data.
 *
 * @param {string} coachId
 * @param {object} [options]
 * @param {string} [options.trainId]       - Train ID for availability
 * @param {string} [options.journeyDate]   - Journey date for availability
 * @returns {Promise<object>} Rendered seat map with grid and metadata
 * @throws {NotFoundError} If the coach does not exist
 */
export const getSeatMap = async (coachId, options = {}) => {
  // 1. Fetch coach with type info
  const coach = await coachRepository.findCoachById(coachId);
  if (!coach) {
    throw new NotFoundError('Coach not found');
  }

  const layoutType = coach.coachType?.layoutType;
  if (!layoutType) {
    throw new ValidationError(
      `Coach ${coach.coachNumber} does not have a layout type configured. ` +
      'Please update the CoachType with a valid layoutType.'
    );
  }

  // 2. Fetch seats with availability
  const seats = await coachRepository.findSeatsByCoachId(coachId, {
    trainId: options.trainId,
    journeyDate: options.journeyDate,
  });

  // 3. Render seat map using the universal renderer
  const seatMap = renderSeatMap(layoutType, seats, {
    trainId: options.trainId,
    journeyDate: options.journeyDate,
  });

  return {
    coachId: coach.id,
    coachNumber: coach.coachNumber,
    train: coach.train,
    layoutType,
    totalSeats: coach.totalSeats,
    ...seatMap,
  };
};

// ── GET SEAT AVAILABILITY ──────────────────────────────────

/**
 * Get seat availability summary for a coach on a specific journey.
 *
 * @param {string} coachId
 * @param {string} trainId
 * @param {string} journeyDate
 * @returns {Promise<object>}
 * @throws {NotFoundError} If the coach does not exist
 */
export const getSeatAvailability = async (coachId, trainId, journeyDate) => {
  const coach = await coachRepository.findCoachById(coachId);
  if (!coach) {
    throw new NotFoundError('Coach not found');
  }

  const counts = await coachRepository.countSeatAvailability(coachId, trainId, journeyDate);

  return {
    coachId: coach.id,
    coachNumber: coach.coachNumber,
    coachClass: coach.coachType?.coachClass,
    trainId,
    journeyDate,
    ...counts,
  };
};

// ── SMART SEAT RECOMMENDATION ──────────────────────────────

/**
 * Get smart seat recommendations based on passenger preferences.
 *
 * @param {object} params
 * @param {string} params.coachId
 * @param {string} params.trainId
 * @param {string} params.journeyDate
 * @param {number} params.passengerCount
 * @param {string[]} params.preferences
 * @returns {Promise<object>}
 * @throws {NotFoundError} If the coach does not exist
 * @throws {ValidationError} If layout type is not configured
 */
export const getRecommendations = async (params) => {
  const { coachId, trainId, journeyDate, passengerCount, preferences } = params;

  // 1. Fetch coach details
  const coach = await coachRepository.findCoachById(coachId);
  if (!coach) {
    throw new NotFoundError('Coach not found');
  }

  const layoutType = coach.coachType?.layoutType;
  if (!layoutType) {
    throw new ValidationError('Coach does not have a layout type configured');
  }

  // 2. Fetch available seats
  const availableSeats = await coachRepository.findAvailableSeats(coachId, trainId, journeyDate);

  if (availableSeats.length < passengerCount) {
    return {
      coachId,
      coachNumber: coach.coachNumber,
      recommendations: [],
      message: `Only ${availableSeats.length} seats available, but ${passengerCount} requested`,
    };
  }

  // 3. Run recommendation engine
  const result = recommendSeats({
    layoutType,
    availableSeats,
    passengerCount,
    preferences,
  });

  return {
    coachId,
    coachNumber: coach.coachNumber,
    ...result,
  };
};

// ── CREATE COACH (ADMIN) ───────────────────────────────────

/**
 * Create a new coach with auto-generated seats.
 *
 * @param {object} data
 * @param {string} data.coachNumber
 * @param {string} data.trainId
 * @param {string} data.coachTypeId
 * @param {number} data.sequence
 * @returns {Promise<object>}
 * @throws {ConflictError} If coach number already exists for the train
 * @throws {NotFoundError} If coach type does not exist
 */
export const createCoach = async (data) => {
  // 1. Check for duplicate coach number on this train
  const existing = await coachRepository.findCoachByTrainAndNumber(data.trainId, data.coachNumber);
  if (existing) {
    throw new ConflictError(`Coach '${data.coachNumber}' already exists on this train`);
  }

  // 2. Fetch coach type to get layout info
  const coach = await coachRepository.findCoachById(data.coachTypeId);
  // We need the coach type directly
  const prisma = (await import('../../database/client.js')).default;
  const coachType = await prisma.coachType.findUnique({
    where: { id: data.coachTypeId },
  });

  if (!coachType) {
    throw new NotFoundError('Coach type not found');
  }

  // 3. Auto-generate seats from layout if layoutType is set
  let seats = null;
  if (coachType.layoutType) {
    seats = generateSeatDefinitions(coachType.layoutType);
  }

  // 4. Create coach with seats
  const created = await coachRepository.createCoach({
    coachNumber: data.coachNumber,
    trainId: data.trainId,
    coachTypeId: data.coachTypeId,
    sequence: data.sequence,
    totalSeats: seats ? seats.length : coachType.seatsPerCoach,
    seats,
  });

  return created;
};

// ── UPDATE COACH (ADMIN) ───────────────────────────────────

/**
 * Update a coach record.
 *
 * @param {string} coachId
 * @param {object} data
 * @returns {Promise<object>}
 * @throws {NotFoundError}
 */
export const updateCoach = async (coachId, data) => {
  const existing = await coachRepository.findCoachById(coachId);
  if (!existing) {
    throw new NotFoundError('Coach not found');
  }

  return coachRepository.updateCoach(coachId, data);
};

// ── LAYOUT TEMPLATE OPERATIONS ─────────────────────────────

/**
 * List all layout templates.
 * @returns {Promise<object[]>}
 */
export const getAllLayoutTemplates = async () => {
  return coachRepository.findAllLayoutTemplates();
};

/**
 * Get a layout template by its layout type.
 *
 * @param {string} layoutType
 * @returns {Promise<object>}
 * @throws {NotFoundError}
 */
export const getLayoutTemplateByType = async (layoutType) => {
  const template = await coachRepository.findLayoutTemplateByType(layoutType);
  if (!template) {
    throw new NotFoundError(`Layout template not found for type: ${layoutType}`);
  }
  return template;
};

/**
 * Create or update a layout template.
 *
 * @param {object} data
 * @returns {Promise<object>}
 */
export const upsertLayoutTemplate = async (data) => {
  return coachRepository.upsertLayoutTemplate(data);
};

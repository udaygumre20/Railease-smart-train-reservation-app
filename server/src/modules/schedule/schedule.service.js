// ============================================================
// Schedule Service
// Business-logic layer for Schedule management operations.
// ============================================================

import prisma from '../../database/client.js';
import * as scheduleRepository from './schedule.repository.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../errors/index.js';

// ── HELPERS ─────────────────────────────────────────────────

/**
 * Validates that the referenced Train and Route actually exist.
 *
 * @param {string} trainId
 * @param {string} routeId
 * @throws {NotFoundError} If either entity does not exist.
 */
const validateRelationsExist = async (trainId, routeId) => {
  if (trainId) {
    const train = await prisma.train.findUnique({ where: { id: trainId } });
    if (!train) throw new NotFoundError('Train not found');
  }

  if (routeId) {
    const route = await prisma.route.findUnique({ where: { id: routeId } });
    if (!route) throw new NotFoundError('Route not found');
  }
};

/**
 * Validates that Arrival Date is after Departure Date.
 *
 * @param {string|Date} effectiveFrom - Departure
 * @param {string|Date} effectiveTo - Arrival
 * @throws {ValidationError} If Arrival is before or equal to Departure.
 */
const validateDateLogic = (effectiveFrom, effectiveTo) => {
  if (effectiveFrom && effectiveTo) {
    const fromDate = new Date(effectiveFrom);
    const toDate = new Date(effectiveTo);

    if (toDate <= fromDate) {
      throw new ValidationError('Arrival date and time must be after departure date and time');
    }
  }
};

// ── CREATE SCHEDULE ─────────────────────────────────────────

/**
 * Create a new schedule linking a Train and a Route.
 *
 * @param {object} data
 * @returns {Promise<object>} Created schedule.
 */
export const createSchedule = async (data) => {
  const { trainId, routeId, effectiveFrom, effectiveTo } = data;

  // 1. Verify Train and Route exist
  await validateRelationsExist(trainId, routeId);

  // 2. Validate Chronology
  validateDateLogic(effectiveFrom, effectiveTo);

  // 3. Prevent duplicate Train-Route combinations (per Prisma schema unique constraint)
  const existing = await scheduleRepository.findScheduleByTrainAndRoute(trainId, routeId);
  if (existing) {
    throw new ConflictError('A schedule for this train and route already exists');
  }

  return scheduleRepository.createSchedule(data);
};

// ── GET SCHEDULE BY ID ──────────────────────────────────────

/**
 * Retrieve a schedule by ID.
 *
 * @param {string} id
 * @returns {Promise<object>} Schedule.
 * @throws {NotFoundError} If not found.
 */
export const getScheduleById = async (id) => {
  const schedule = await scheduleRepository.findScheduleById(id);
  if (!schedule) {
    throw new NotFoundError('Schedule not found');
  }
  return schedule;
};

// ── GET ALL SCHEDULES ───────────────────────────────────────

/**
 * Retrieve a paginated, filterable list of schedules.
 *
 * @param {object} query
 * @returns {Promise<{ schedules: object[], pagination: object }>}
 */
export const getAllSchedules = async (query) => {
  const {
    page = 1,
    limit = 10,
    trainId,
    routeId,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const where = {};

  if (trainId) where.trainId = trainId;
  if (routeId) where.routeId = routeId;
  if (isActive !== undefined) where.isActive = isActive;

  const skip = (page - 1) * limit;
  const whereClause = Object.keys(where).length > 0 ? where : undefined;

  const [schedules, totalRecords] = await Promise.all([
    scheduleRepository.findAllSchedules({
      skip,
      take: limit,
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
    }),
    scheduleRepository.countSchedules(whereClause),
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  return {
    schedules,
    pagination: {
      currentPage: page,
      limit,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

// ── UPDATE SCHEDULE ─────────────────────────────────────────

/**
 * Update a schedule by ID.
 *
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>} Updated schedule.
 */
export const updateSchedule = async (id, data) => {
  const existingSchedule = await scheduleRepository.findScheduleById(id);
  if (!existingSchedule) {
    throw new NotFoundError('Schedule not found');
  }

  // Use existing values for chronology check if new ones aren't provided
  const newEffectiveFrom = data.effectiveFrom || existingSchedule.effectiveFrom;
  const newEffectiveTo = data.effectiveTo || existingSchedule.effectiveTo;
  
  validateDateLogic(newEffectiveFrom, newEffectiveTo);

  // If changing trainId or routeId, validate they exist and check for duplicates
  if (data.trainId || data.routeId) {
    const newTrainId = data.trainId || existingSchedule.trainId;
    const newRouteId = data.routeId || existingSchedule.routeId;
    
    await validateRelationsExist(data.trainId, data.routeId);

    if (newTrainId !== existingSchedule.trainId || newRouteId !== existingSchedule.routeId) {
      const duplicate = await scheduleRepository.findScheduleByTrainAndRoute(newTrainId, newRouteId);
      if (duplicate) {
        throw new ConflictError('A schedule for this train and route already exists');
      }
    }
  }

  return scheduleRepository.updateSchedule(id, data);
};

// ── DELETE SCHEDULE ─────────────────────────────────────────

/**
 * Soft delete a schedule.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteSchedule = async (id) => {
  const schedule = await scheduleRepository.findScheduleById(id);
  if (!schedule) {
    throw new NotFoundError('Schedule not found');
  }

  return scheduleRepository.softDeleteSchedule(id);
};

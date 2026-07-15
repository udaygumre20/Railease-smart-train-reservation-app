// ============================================================
// Schedule Repository
// Data-access layer for Train Schedule (TrainRoute) operations.
// All Prisma queries live here, isolating DB logic from services.
// ============================================================

import prisma from '../../database/client.js';

/**
 * Default relations to include when fetching a schedule.
 * Eager-loads the train and route details.
 */
const INCLUDE_RELATIONS = {
  train: {
    select: {
      id: true,
      trainNumber: true,
      name: true,
      status: true,
    },
  },
  route: {
    select: {
      id: true,
      code: true,
      name: true,
      totalDistance: true,
    },
  },
};

// ── CREATE SCHEDULE ─────────────────────────────────────────

/**
 * Insert a new train schedule (TrainRoute) into the database.
 *
 * @param {object} data
 * @returns {Promise<object>} Created schedule with relations.
 */
export const createSchedule = async (data) => {
  return prisma.trainRoute.create({
    data,
    include: INCLUDE_RELATIONS,
  });
};

// ── FIND SCHEDULE BY ID ─────────────────────────────────────

/**
 * Retrieve a schedule by its unique UUID.
 *
 * @param {string} id
 * @returns {Promise<object|null>} Schedule or null.
 */
export const findScheduleById = async (id) => {
  return prisma.trainRoute.findUnique({
    where: { id },
    include: INCLUDE_RELATIONS,
  });
};

// ── CHECK DUPLICATE SCHEDULE ────────────────────────────────

/**
 * Find a schedule linking the exact same train and route.
 * Used by the service to prevent duplicates.
 *
 * @param {string} trainId
 * @param {string} routeId
 * @returns {Promise<object|null>} Schedule or null.
 */
export const findScheduleByTrainAndRoute = async (trainId, routeId) => {
  return prisma.trainRoute.findUnique({
    where: {
      trainId_routeId: {
        trainId,
        routeId,
      },
    },
  });
};

// ── FIND ALL SCHEDULES ──────────────────────────────────────

/**
 * Retrieve a paginated, sortable, and filterable list of schedules.
 *
 * @param {object} params
 * @param {number} params.skip
 * @param {number} params.take
 * @param {object} params.where
 * @param {object} params.orderBy
 * @returns {Promise<object[]>} Array of schedules.
 */
export const findAllSchedules = async ({ skip, take, where, orderBy }) => {
  return prisma.trainRoute.findMany({
    where,
    orderBy,
    skip,
    take,
    include: INCLUDE_RELATIONS,
  });
};

// ── COUNT SCHEDULES ─────────────────────────────────────────

/**
 * Count the total number of schedules matching filters.
 *
 * @param {object} where
 * @returns {Promise<number>}
 */
export const countSchedules = async (where) => {
  return prisma.trainRoute.count({ where });
};

// ── UPDATE SCHEDULE ─────────────────────────────────────────

/**
 * Update an existing schedule's fields.
 *
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>} Updated schedule.
 */
export const updateSchedule = async (id, data) => {
  return prisma.trainRoute.update({
    where: { id },
    data,
    include: INCLUDE_RELATIONS,
  });
};

// ── SOFT DELETE SCHEDULE ────────────────────────────────────

/**
 * Soft delete a schedule by setting isActive to false.
 *
 * @param {string} id
 * @returns {Promise<object>} Deactivated schedule.
 */
export const softDeleteSchedule = async (id) => {
  return prisma.trainRoute.update({
    where: { id },
    data: { isActive: false },
    include: INCLUDE_RELATIONS,
  });
};

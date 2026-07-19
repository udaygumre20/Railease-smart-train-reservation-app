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

// ── SEAT AVAILABILITY (PHASE 4 PART 6) ──────────────────────

/**
 * Get the sequence number of a specific station on a route.
 * 
 * @param {string} routeId 
 * @param {string} stationId 
 * @returns {Promise<number|null>} The sequence number or null if not found.
 */
export const getRouteStopSequence = async (routeId, stationId) => {
  const stop = await prisma.routeStop.findUnique({
    where: {
      routeId_stationId: { routeId, stationId }
    },
    select: { sequenceNumber: true }
  });
  return stop?.sequenceNumber ?? null;
};

/**
 * Get the total number of seats for a specific travel class on a train.
 * 
 * @param {string} trainId 
 * @param {string} travelClassCode - e.g., 'SL', '3A'
 * @returns {Promise<number>} Total seats
 */
export const getTotalSeatsForClass = async (trainId, travelClassCode) => {
  const result = await prisma.coach.aggregate({
    where: {
      trainId,
      isActive: true,
      coachType: { code: travelClassCode }
    },
    _sum: {
      totalSeats: true
    }
  });
  return result._sum.totalSeats || 0;
};

/**
 * Get all confirmed bookings for a specific train, date, and class.
 * Includes the sequence numbers for boarding and alighting stations.
 * 
 * @param {string} trainId 
 * @param {string} routeId 
 * @param {Date} journeyDate 
 * @param {string} travelClass 
 * @param {string} [quota]
 * @returns {Promise<object[]>}
 */
export const getConfirmedBookings = async (trainId, routeId, journeyDate, travelClass, quota) => {
  const where = {
    trainId,
    journeyDate,
    status: 'CONFIRMED',
    coachPreference: travelClass,
  };
  if (quota) where.quota = quota;

  return prisma.booking.findMany({
    where,
    select: {
      totalPassengers: true,
      boardingStationId: true,
      alightingStationId: true,
    }
  });
};

/**
 * Fetch all route stops for a route to map station IDs to sequence numbers in memory.
 * @param {string} routeId 
 * @returns {Promise<Record<string, number>>} Map of stationId -> sequenceNumber
 */
export const getRouteStopsMap = async (routeId) => {
  const stops = await prisma.routeStop.findMany({
    where: { routeId },
    select: { stationId: true, sequenceNumber: true }
  });
  const map = {};
  for (const stop of stops) {
    map[stop.stationId] = stop.sequenceNumber;
  }
  return map;
};

/**
 * Get the total number of non-available seats (BOOKED, LOCKED, RAC, etc.) 
 * for a specific travel class on a train on a given journey date.
 * 
 * @param {string} trainId 
 * @param {Date} journeyDate 
 * @param {string} travelClassCode 
 * @returns {Promise<number>} Number of non-available seats
 */
export const getNonAvailableSeatsCount = async (trainId, journeyDate, travelClassCode) => {
  const result = await prisma.seatAvailability.count({
    where: {
      trainId,
      journeyDate,
      status: {
        not: 'AVAILABLE'
      },
      seat: {
        coach: {
          coachType: {
            code: travelClassCode
          }
        }
      }
    }
  });
  return result;
};

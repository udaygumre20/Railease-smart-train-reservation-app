// ============================================================
// Train Repository
// Data-access layer for train-related database operations.
// All Prisma queries for trains live here – services call
// repository methods rather than touching Prisma directly.
// ============================================================

import prisma from '../../database/client.js';

// ── CREATE TRAIN ────────────────────────────────────────────

/**
 * Insert a new train record into the database.
 *
 * @param {object} data
 * @param {string} data.trainNumber
 * @param {string} data.name
 * @param {string} [data.status]
 * @returns {Promise<object>} The created train record.
 */
export const createTrain = async (data) => {
  return prisma.train.create({ data });
};

// ── FIND TRAIN BY ID ────────────────────────────────────────

/**
 * Look up a single train by its primary key (UUID).
 * Optionally includes related coaches with their coach types.
 *
 * @param {string} id
 * @param {object} [options]
 * @param {boolean} [options.includeCoaches=false] - Include coaches & coach types.
 * @returns {Promise<object|null>} Train record or null if not found.
 */
export const findTrainById = async (id, options = {}) => {
  return prisma.train.findUnique({
    where: { id },
    include: options.includeCoaches
      ? {
          coaches: {
            include: { coachType: true },
            orderBy: { sequence: 'asc' },
          },
        }
      : undefined,
  });
};

// ── FIND TRAIN BY NUMBER ────────────────────────────────────

/**
 * Look up a single train by its unique train number.
 * Used for duplicate-checking during create/update.
 *
 * @param {string} trainNumber
 * @returns {Promise<object|null>} Train record or null if not found.
 */
export const findTrainByNumber = async (trainNumber) => {
  return prisma.train.findUnique({
    where: { trainNumber },
  });
};

// ── FIND ALL TRAINS (PAGINATED) ─────────────────────────────

/**
 * Retrieve a paginated, searchable, sortable list of trains.
 *
 * @param {object} filters
 * @param {number} filters.skip     - Records to skip (offset).
 * @param {number} filters.take     - Records per page (limit).
 * @param {object} [filters.where]  - Prisma where clause.
 * @param {object} [filters.orderBy] - Prisma orderBy clause.
 * @returns {Promise<object[]>} Array of train records.
 */
export const findAllTrains = async ({ skip, take, where, orderBy }) => {
  return prisma.train.findMany({
    where,
    orderBy,
    skip,
    take,
  });
};

// ── COUNT TRAINS ────────────────────────────────────────────

/**
 * Count matching train records for pagination metadata.
 *
 * @param {object} [where] - Prisma where clause.
 * @returns {Promise<number>} Total count of matching records.
 */
export const countTrains = async (where) => {
  return prisma.train.count({ where });
};

// ── UPDATE TRAIN ────────────────────────────────────────────

/**
 * Update a train record by ID.
 *
 * @param {string} id
 * @param {object} data - Fields to update.
 * @returns {Promise<object>} The updated train record.
 */
export const updateTrain = async (id, data) => {
  return prisma.train.update({
    where: { id },
    data,
  });
};

// ── DELETE TRAIN ────────────────────────────────────────────

/**
 * Permanently delete a train record by ID.
 * Note: The Train schema does not have a soft-delete field.
 *
 * @param {string} id
 * @returns {Promise<object>} The deleted train record.
 */
export const deleteTrain = async (id) => {
  return prisma.train.delete({
    where: { id },
  });
};

// ── TRAIN SEARCH (PHASE 4 PART 5) ───────────────────────────

/**
 * Find all routes that contain both source and destination stations,
 * where the source station sequence is strictly less than destination sequence.
 * 
 * @param {string} sourceStationId 
 * @param {string} destinationStationId 
 * @returns {Promise<object[]>} Array of routes with filtered stops
 */
export const findRoutesBetweenStations = async (sourceStationId, destinationStationId) => {
  const routes = await prisma.route.findMany({
    where: {
      isActive: true,
      stops: {
        some: { stationId: sourceStationId },
      },
      AND: {
        stops: { some: { stationId: destinationStationId } },
      },
    },
    include: {
      stops: {
        where: {
          stationId: { in: [sourceStationId, destinationStationId] },
        },
        orderBy: { sequenceNumber: 'asc' },
        include: {
          station: { select: { id: true, code: true, name: true, city: true } },
        }
      },
    },
  });

  // Filter out routes where the source is AFTER the destination
  return routes.filter((route) => {
    if (route.stops.length !== 2) return false;
    const sourceStop = route.stops.find(s => s.stationId === sourceStationId);
    const destStop = route.stops.find(s => s.stationId === destinationStationId);
    
    if (!sourceStop || !destStop) return false;
    return sourceStop.sequenceNumber < destStop.sequenceNumber;
  });
};

/**
 * Find active trains running on specific routes within a date range,
 * optionally matching run days.
 * 
 * @param {string[]} routeIds 
 * @param {Date} date 
 * @returns {Promise<object[]>}
 */
export const findActiveTrainsForRoutes = async (routeIds) => {
  return prisma.trainRoute.findMany({
    where: {
      routeId: { in: routeIds },
      isActive: true,
      train: { status: 'ACTIVE' }
    },
    include: {
      train: true,
      route: {
        select: {
          id: true,
          name: true,
          code: true,
          totalDistance: true,
        }
      }
    },
  });
};

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

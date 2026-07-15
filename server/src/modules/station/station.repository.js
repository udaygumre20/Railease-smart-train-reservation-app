// ============================================================
// Station Repository
// Data-access layer for station-related database operations.
// All Prisma queries for stations live here – services call
// repository methods rather than touching Prisma directly.
// ============================================================

import prisma from '../../database/client.js';

// ── CREATE STATION ──────────────────────────────────────────

/**
 * Insert a new station record into the database.
 *
 * @param {object} data
 * @param {string} data.code
 * @param {string} data.name
 * @param {string} data.city
 * @param {string} data.state
 * @param {string} [data.zone]
 * @param {number} [data.latitude]
 * @param {number} [data.longitude]
 * @param {number} [data.platforms]
 * @returns {Promise<object>} The created station record.
 */
export const createStation = async (data) => {
  return prisma.station.create({ data });
};

// ── FIND STATION BY ID ──────────────────────────────────────

/**
 * Look up a single station by its primary key (UUID).
 *
 * @param {string} id
 * @returns {Promise<object|null>} Station record or null if not found.
 */
export const findStationById = async (id) => {
  return prisma.station.findUnique({
    where: { id },
  });
};

// ── FIND STATION BY CODE ────────────────────────────────────

/**
 * Look up a single station by its unique code.
 * Used for duplicate-checking during create/update.
 *
 * @param {string} code
 * @returns {Promise<object|null>} Station record or null if not found.
 */
export const findStationByCode = async (code) => {
  return prisma.station.findUnique({
    where: { code },
  });
};

// ── FIND ALL STATIONS (PAGINATED) ───────────────────────────

/**
 * Retrieve a paginated, searchable, sortable list of stations.
 *
 * @param {object} filters
 * @param {number} filters.skip     - Records to skip (offset).
 * @param {number} filters.take     - Records per page (limit).
 * @param {object} [filters.where]  - Prisma where clause.
 * @param {object} [filters.orderBy] - Prisma orderBy clause.
 * @returns {Promise<object[]>} Array of station records.
 */
export const findAllStations = async ({ skip, take, where, orderBy }) => {
  return prisma.station.findMany({
    where,
    orderBy,
    skip,
    take,
  });
};

// ── COUNT STATIONS ──────────────────────────────────────────

/**
 * Count matching station records for pagination metadata.
 *
 * @param {object} [where] - Prisma where clause.
 * @returns {Promise<number>} Total count of matching records.
 */
export const countStations = async (where) => {
  return prisma.station.count({ where });
};

// ── UPDATE STATION ──────────────────────────────────────────

/**
 * Update a station record by ID.
 *
 * @param {string} id
 * @param {object} data - Fields to update.
 * @returns {Promise<object>} The updated station record.
 */
export const updateStation = async (id, data) => {
  return prisma.station.update({
    where: { id },
    data,
  });
};

// ── SOFT DELETE STATION ─────────────────────────────────────

/**
 * Soft-delete a station by setting isActive to false.
 *
 * @param {string} id
 * @returns {Promise<object>} The updated station record.
 */
export const softDeleteStation = async (id) => {
  return prisma.station.update({
    where: { id },
    data: { isActive: false },
  });
};

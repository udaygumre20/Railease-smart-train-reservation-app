// ============================================================
// Route Repository
// Data-access layer for route-related database operations.
// All Prisma queries for routes live here – services call
// repository methods rather than touching Prisma directly.
//
// Routes include nested RouteStop records. The repository
// handles nested creates, transactional stop replacement,
// and eager-loading of stops with station details.
// ============================================================

import prisma from '../../database/client.js';

/**
 * Default include clause for loading stops with station info,
 * ordered by sequence number.
 */
const STOPS_INCLUDE = {
  stops: {
    include: {
      station: {
        select: {
          id: true,
          code: true,
          name: true,
          city: true,
          state: true,
        },
      },
    },
    orderBy: { sequenceNumber: 'asc' },
  },
};

// ── CREATE ROUTE ────────────────────────────────────────────

/**
 * Insert a new route with its stops (nested create).
 *
 * @param {object} data
 * @param {string} data.name
 * @param {string} data.code
 * @param {number} data.totalDistance
 * @param {object[]} data.stops - Array of route stop data.
 * @returns {Promise<object>} The created route with stops.
 */
export const createRoute = async ({ stops, ...routeData }) => {
  return prisma.route.create({
    data: {
      ...routeData,
      stops: {
        create: stops,
      },
    },
    include: STOPS_INCLUDE,
  });
};

// ── FIND ROUTE BY ID ────────────────────────────────────────

/**
 * Look up a single route by its primary key (UUID).
 * Includes stops with station details.
 *
 * @param {string} id
 * @returns {Promise<object|null>} Route record or null.
 */
export const findRouteById = async (id) => {
  return prisma.route.findUnique({
    where: { id },
    include: STOPS_INCLUDE,
  });
};

// ── FIND ROUTE BY CODE ──────────────────────────────────────

/**
 * Look up a single route by its unique code.
 * Used for duplicate-checking during create/update.
 *
 * @param {string} code
 * @returns {Promise<object|null>} Route record or null.
 */
export const findRouteByCode = async (code) => {
  return prisma.route.findUnique({
    where: { code },
  });
};

// ── FIND ALL ROUTES (PAGINATED) ─────────────────────────────

/**
 * Retrieve a paginated, searchable, sortable list of routes.
 * Includes stops with station details.
 *
 * @param {object} filters
 * @param {number} filters.skip
 * @param {number} filters.take
 * @param {object} [filters.where]
 * @param {object} [filters.orderBy]
 * @returns {Promise<object[]>} Array of route records.
 */
export const findAllRoutes = async ({ skip, take, where, orderBy }) => {
  return prisma.route.findMany({
    where,
    orderBy,
    skip,
    take,
    include: STOPS_INCLUDE,
  });
};

// ── COUNT ROUTES ────────────────────────────────────────────

/**
 * Count matching route records for pagination metadata.
 *
 * @param {object} [where]
 * @returns {Promise<number>}
 */
export const countRoutes = async (where) => {
  return prisma.route.count({ where });
};

// ── UPDATE ROUTE ────────────────────────────────────────────

/**
 * Update a route's scalar fields (not stops).
 *
 * @param {string} id
 * @param {object} data - Fields to update.
 * @returns {Promise<object>} The updated route with stops.
 */
export const updateRoute = async (id, data) => {
  return prisma.route.update({
    where: { id },
    data,
    include: STOPS_INCLUDE,
  });
};

// ── UPDATE ROUTE WITH STOPS (TRANSACTION) ───────────────────

/**
 * Update a route's fields AND replace all its stops atomically.
 * Uses a transaction to delete existing stops and create new ones.
 *
 * @param {string} id
 * @param {object} routeData - Scalar fields to update.
 * @param {object[]} stops - New stop records to create.
 * @returns {Promise<object>} The updated route with new stops.
 */
export const updateRouteWithStops = async (id, routeData, stops) => {
  return prisma.$transaction(async (tx) => {
    // 1. Delete all existing stops for this route
    await tx.routeStop.deleteMany({
      where: { routeId: id },
    });

    // 2. Update the route and create new stops
    return tx.route.update({
      where: { id },
      data: {
        ...routeData,
        stops: {
          create: stops,
        },
      },
      include: STOPS_INCLUDE,
    });
  });
};

// ── SOFT DELETE ROUTE ───────────────────────────────────────

/**
 * Soft-delete a route by setting isActive to false.
 *
 * @param {string} id
 * @returns {Promise<object>} The updated route.
 */
export const softDeleteRoute = async (id) => {
  return prisma.route.update({
    where: { id },
    data: { isActive: false },
    include: STOPS_INCLUDE,
  });
};

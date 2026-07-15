// ============================================================
// Route Service
// Business-logic layer for route management operations.
// Controllers delegate here – this module orchestrates between
// the route repository, station validation, and error classes.
//
// Rules:
//  • No direct Prisma access – use route.repository.js
//  • No HTTP concepts (req/res) – those stay in controllers
//  • Throw custom error classes for error conditions
// ============================================================

import prisma from '../../database/client.js';
import * as routeRepository from './route.repository.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../errors/index.js';

// ── HELPERS ─────────────────────────────────────────────────

/**
 * Validate that all station IDs in a stops array actually exist.
 * Throws NotFoundError listing any missing stations.
 *
 * @param {string[]} stationIds - Array of station UUIDs.
 * @throws {NotFoundError} If any station does not exist.
 */
const validateStationsExist = async (stationIds) => {
  const stations = await prisma.station.findMany({
    where: { id: { in: stationIds } },
    select: { id: true },
  });

  const foundIds = new Set(stations.map((s) => s.id));
  const missingIds = stationIds.filter((id) => !foundIds.has(id));

  if (missingIds.length > 0) {
    throw new NotFoundError(
      `Station(s) not found: ${missingIds.join(', ')}`,
    );
  }
};

/**
 * Validate that stops have no duplicate station IDs.
 *
 * @param {object[]} stops - Array of stop objects with stationId.
 * @throws {ValidationError} If duplicate stations are found.
 */
const validateUniqueStations = (stops) => {
  const stationIds = stops.map((s) => s.stationId);
  const duplicates = stationIds.filter(
    (id, index) => stationIds.indexOf(id) !== index,
  );

  if (duplicates.length > 0) {
    throw new ValidationError('Duplicate stations in route stops are not allowed', [
      { field: 'stops', message: `Duplicate station ID(s): ${[...new Set(duplicates)].join(', ')}` },
    ]);
  }
};

/**
 * Validate that stops have unique, sequential sequence numbers.
 *
 * @param {object[]} stops - Array of stop objects with sequenceNumber.
 * @throws {ValidationError} If duplicate sequence numbers are found.
 */
const validateUniqueSequence = (stops) => {
  const seqNums = stops.map((s) => s.sequenceNumber);
  const duplicates = seqNums.filter(
    (num, index) => seqNums.indexOf(num) !== index,
  );

  if (duplicates.length > 0) {
    throw new ValidationError('Duplicate sequence numbers in route stops are not allowed', [
      { field: 'stops', message: `Duplicate sequence number(s): ${[...new Set(duplicates)].join(', ')}` },
    ]);
  }
};

// ── CREATE ROUTE ────────────────────────────────────────────

/**
 * Create a new route with its stops.
 *
 * Flow:
 *  1. Check for duplicate route code
 *  2. Validate all stations exist
 *  3. Validate no duplicate stations or sequence numbers
 *  4. Create route with nested stops
 *
 * @param {object} data
 * @param {string} data.name
 * @param {string} data.code
 * @param {number} data.totalDistance
 * @param {object[]} data.stops
 * @returns {Promise<object>} The created route with stops.
 * @throws {ConflictError} If route code already exists.
 * @throws {NotFoundError} If any station does not exist.
 * @throws {ValidationError} If stops have duplicates.
 */
export const createRoute = async (data) => {
  const { stops = [], ...routeData } = data;

  // 1. Check for duplicate route code
  const existingRoute = await routeRepository.findRouteByCode(routeData.code);
  if (existingRoute) {
    throw new ConflictError(`A route with code '${routeData.code}' already exists`);
  }

  // 2. Validate all stations exist
  if (stops.length > 0) {
    const stationIds = stops.map((s) => s.stationId);
    await validateStationsExist(stationIds);

    // 3. Validate no duplicate stations or sequence numbers
    validateUniqueStations(stops);
    validateUniqueSequence(stops);
  }

  // 4. Create route with nested stops
  const route = await routeRepository.createRoute({
    ...routeData,
    stops,
  });

  return route;
};

// ── GET ROUTE BY ID ─────────────────────────────────────────

/**
 * Retrieve a single route by ID, including stops with station details.
 *
 * @param {string} id - Route UUID.
 * @returns {Promise<object>} The route record with stops.
 * @throws {NotFoundError} If the route does not exist.
 */
export const getRouteById = async (id) => {
  const route = await routeRepository.findRouteById(id);

  if (!route) {
    throw new NotFoundError('Route not found');
  }

  return route;
};

// ── GET ALL ROUTES ──────────────────────────────────────────

/**
 * Retrieve a paginated, searchable, sortable list of routes.
 *
 * @param {object} query
 * @param {number}  [query.page=1]
 * @param {number}  [query.limit=10]
 * @param {string}  [query.search]      - Search by code or name.
 * @param {string}  [query.stationId]   - Filter routes passing through this station.
 * @param {string}  [query.sortBy='createdAt']
 * @param {string}  [query.sortOrder='desc']
 * @param {boolean} [query.isActive]    - Filter by active status.
 * @returns {Promise<{ routes: object[], pagination: object }>}
 */
export const getAllRoutes = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    stationId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    isActive,
  } = query;

  // Build Prisma where clause
  const where = {};

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter routes that pass through a specific station
  if (stationId) {
    where.stops = {
      some: { stationId },
    };
  }

  const skip = (page - 1) * limit;
  const whereClause = Object.keys(where).length > 0 ? where : undefined;

  const [routes, totalRecords] = await Promise.all([
    routeRepository.findAllRoutes({
      skip,
      take: limit,
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
    }),
    routeRepository.countRoutes(whereClause),
  ]);

  const totalPages = Math.ceil(totalRecords / limit);
  const pagination = {
    currentPage: page,
    limit,
    totalRecords,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { routes, pagination };
};

// ── UPDATE ROUTE ────────────────────────────────────────────

/**
 * Update a route by ID. If stops are provided, they replace
 * all existing stops atomically.
 *
 * Flow:
 *  1. Check route exists
 *  2. If code is changing, check for duplicates
 *  3. If stops provided, validate stations and uniqueness
 *  4. Update route (with or without stop replacement)
 *
 * @param {string} id - Route UUID.
 * @param {object} data - Fields to update (may include stops[]).
 * @returns {Promise<object>} The updated route.
 * @throws {NotFoundError} If the route does not exist.
 * @throws {ConflictError} If new code is already taken.
 * @throws {NotFoundError} If any station does not exist.
 * @throws {ValidationError} If stops have duplicates.
 */
export const updateRoute = async (id, data) => {
  const { stops, ...routeData } = data;

  // 1. Check route exists
  const existingRoute = await routeRepository.findRouteById(id);
  if (!existingRoute) {
    throw new NotFoundError('Route not found');
  }

  // 2. If code is changing, check for duplicates
  if (routeData.code && routeData.code !== existingRoute.code) {
    const duplicate = await routeRepository.findRouteByCode(routeData.code);
    if (duplicate) {
      throw new ConflictError(`A route with code '${routeData.code}' already exists`);
    }
  }

  // 3. If stops provided, validate and replace
  if (stops && stops.length > 0) {
    const stationIds = stops.map((s) => s.stationId);
    await validateStationsExist(stationIds);
    validateUniqueStations(stops);
    validateUniqueSequence(stops);

    return routeRepository.updateRouteWithStops(id, routeData, stops);
  }

  // 4. Update route fields only (no stop changes)
  const hasRouteData = Object.keys(routeData).length > 0;
  if (!hasRouteData) {
    // Nothing to update — return existing
    return existingRoute;
  }

  return routeRepository.updateRoute(id, routeData);
};

// ── DELETE ROUTE (SOFT DELETE) ──────────────────────────────

/**
 * Soft-delete a route by setting isActive to false.
 *
 * @param {string} id - Route UUID.
 * @returns {Promise<object>} The soft-deleted route.
 * @throws {NotFoundError} If the route does not exist.
 */
export const deleteRoute = async (id) => {
  const existingRoute = await routeRepository.findRouteById(id);
  if (!existingRoute) {
    throw new NotFoundError('Route not found');
  }

  return routeRepository.softDeleteRoute(id);
};

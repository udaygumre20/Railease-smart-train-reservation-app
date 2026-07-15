// ============================================================
// Station Service
// Business-logic layer for station management operations.
// Controllers delegate here – this module orchestrates between
// the station repository and custom error classes.
//
// Rules:
//  • No direct Prisma access – use station.repository.js
//  • No HTTP concepts (req/res) – those stay in controllers
//  • Throw custom error classes for error conditions
// ============================================================

import * as stationRepository from './station.repository.js';
import { ConflictError, NotFoundError } from '../../errors/index.js';

// ── CREATE STATION ──────────────────────────────────────────

/**
 * Create a new station.
 *
 * Flow:
 *  1. Check for duplicate station code
 *  2. Create station record
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
 * @returns {Promise<object>} The created station.
 * @throws {ConflictError} If a station with the same code already exists.
 */
export const createStation = async (data) => {
  // 1. Check for duplicate station code
  const existingStation = await stationRepository.findStationByCode(data.code);
  if (existingStation) {
    throw new ConflictError(`A station with code '${data.code}' already exists`);
  }

  // 2. Create station
  const station = await stationRepository.createStation(data);

  return station;
};

// ── GET STATION BY ID ───────────────────────────────────────

/**
 * Retrieve a single station by ID.
 *
 * @param {string} id - Station UUID.
 * @returns {Promise<object>} The station record.
 * @throws {NotFoundError} If the station does not exist.
 */
export const getStationById = async (id) => {
  const station = await stationRepository.findStationById(id);

  if (!station) {
    throw new NotFoundError('Station not found');
  }

  return station;
};

// ── GET ALL STATIONS ────────────────────────────────────────

/**
 * Retrieve a paginated, searchable, sortable list of stations.
 * By default, only active stations are returned.
 *
 * @param {object} query
 * @param {number}  [query.page=1]
 * @param {number}  [query.limit=10]
 * @param {string}  [query.search]        - Search by code, name, or city.
 * @param {string}  [query.sortBy='createdAt']
 * @param {string}  [query.sortOrder='desc']
 * @param {boolean} [query.isActive]      - Filter by active status.
 * @returns {Promise<{ stations: object[], pagination: object }>}
 */
export const getAllStations = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    isActive,
  } = query;

  // Build Prisma where clause
  const where = {};

  // Active status filter (defaults to showing only active stations)
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // Search across code, name, and city
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Calculate offset
  const skip = (page - 1) * limit;

  // Execute queries in parallel
  const [stations, totalRecords] = await Promise.all([
    stationRepository.findAllStations({
      skip,
      take: limit,
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { [sortBy]: sortOrder },
    }),
    stationRepository.countStations(
      Object.keys(where).length > 0 ? where : undefined,
    ),
  ]);

  // Build pagination metadata
  const totalPages = Math.ceil(totalRecords / limit);
  const pagination = {
    currentPage: page,
    limit,
    totalRecords,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { stations, pagination };
};

// ── UPDATE STATION ──────────────────────────────────────────

/**
 * Update a station by ID.
 *
 * Flow:
 *  1. Check that the station exists
 *  2. If code is changing, check for duplicates
 *  3. Update the record
 *
 * @param {string} id - Station UUID.
 * @param {object} data - Fields to update.
 * @returns {Promise<object>} The updated station.
 * @throws {NotFoundError} If the station does not exist.
 * @throws {ConflictError} If the new station code is already taken.
 */
export const updateStation = async (id, data) => {
  // 1. Check that the station exists
  const existingStation = await stationRepository.findStationById(id);
  if (!existingStation) {
    throw new NotFoundError('Station not found');
  }

  // 2. If code is changing, check for duplicates
  if (data.code && data.code !== existingStation.code) {
    const duplicate = await stationRepository.findStationByCode(data.code);
    if (duplicate) {
      throw new ConflictError(`A station with code '${data.code}' already exists`);
    }
  }

  // 3. Update the record
  const updatedStation = await stationRepository.updateStation(id, data);

  return updatedStation;
};

// ── DELETE STATION (SOFT DELETE) ────────────────────────────

/**
 * Soft-delete a station by setting isActive to false.
 *
 * @param {string} id - Station UUID.
 * @returns {Promise<object>} The soft-deleted station.
 * @throws {NotFoundError} If the station does not exist.
 */
export const deleteStation = async (id) => {
  // Check that the station exists
  const existingStation = await stationRepository.findStationById(id);
  if (!existingStation) {
    throw new NotFoundError('Station not found');
  }

  // Soft delete
  const deletedStation = await stationRepository.softDeleteStation(id);

  return deletedStation;
};

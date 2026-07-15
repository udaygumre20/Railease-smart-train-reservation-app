// ============================================================
// Train Service
// Business-logic layer for train management operations.
// Controllers delegate here – this module orchestrates between
// the train repository and custom error classes.
//
// Rules:
//  • No direct Prisma access – use train.repository.js
//  • No HTTP concepts (req/res) – those stay in controllers
//  • Throw custom error classes for error conditions
// ============================================================

import * as trainRepository from './train.repository.js';
import { ConflictError, NotFoundError, ValidationError } from '../../errors/index.js';

// ── CREATE TRAIN ────────────────────────────────────────────

/**
 * Create a new train.
 *
 * Flow:
 *  1. Check for duplicate train number
 *  2. Create train record
 *
 * @param {object} data
 * @param {string} data.trainNumber
 * @param {string} data.name
 * @param {string} [data.status]
 * @returns {Promise<object>} The created train.
 * @throws {ConflictError} If a train with the same number already exists.
 */
export const createTrain = async (data) => {
  // 1. Check for duplicate train number
  const existingTrain = await trainRepository.findTrainByNumber(data.trainNumber);
  if (existingTrain) {
    throw new ConflictError(`A train with number '${data.trainNumber}' already exists`);
  }

  // 2. Create train
  const train = await trainRepository.createTrain(data);

  return train;
};

// ── GET TRAIN BY ID ─────────────────────────────────────────

/**
 * Retrieve a single train by ID, including related coaches.
 *
 * @param {string} id - Train UUID.
 * @returns {Promise<object>} The train record.
 * @throws {NotFoundError} If the train does not exist.
 */
export const getTrainById = async (id) => {
  const train = await trainRepository.findTrainById(id, { includeCoaches: true });

  if (!train) {
    throw new NotFoundError('Train not found');
  }

  return train;
};

// ── GET ALL TRAINS ──────────────────────────────────────────

/**
 * Retrieve a paginated, searchable, sortable list of trains.
 *
 * @param {object} query
 * @param {number} [query.page=1]        - Page number.
 * @param {number} [query.limit=10]      - Records per page.
 * @param {string} [query.search]        - Search by train number or name.
 * @param {string} [query.sortBy='createdAt'] - Field to sort by.
 * @param {string} [query.sortOrder='desc']   - Sort direction (asc/desc).
 * @returns {Promise<{ trains: object[], pagination: object }>}
 */
export const getAllTrains = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  // Build Prisma where clause
  const where = search
    ? {
        OR: [
          { trainNumber: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }
    : undefined;

  // Calculate offset
  const skip = (page - 1) * limit;

  // Execute queries in parallel
  const [trains, totalRecords] = await Promise.all([
    trainRepository.findAllTrains({
      skip,
      take: limit,
      where,
      orderBy: { [sortBy]: sortOrder },
    }),
    trainRepository.countTrains(where),
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

  return { trains, pagination };
};

// ── UPDATE TRAIN ────────────────────────────────────────────

/**
 * Update a train by ID.
 *
 * Flow:
 *  1. Check that the train exists
 *  2. If trainNumber is changing, check for duplicates
 *  3. Update the record
 *
 * @param {string} id - Train UUID.
 * @param {object} data - Fields to update.
 * @returns {Promise<object>} The updated train.
 * @throws {NotFoundError} If the train does not exist.
 * @throws {ConflictError} If the new train number is already taken.
 */
export const updateTrain = async (id, data) => {
  // 1. Check that the train exists
  const existingTrain = await trainRepository.findTrainById(id);
  if (!existingTrain) {
    throw new NotFoundError('Train not found');
  }

  // 2. If trainNumber is changing, check for duplicates
  if (data.trainNumber && data.trainNumber !== existingTrain.trainNumber) {
    const duplicate = await trainRepository.findTrainByNumber(data.trainNumber);
    if (duplicate) {
      throw new ConflictError(`A train with number '${data.trainNumber}' already exists`);
    }
  }

  // 3. Update the record
  const updatedTrain = await trainRepository.updateTrain(id, data);

  return updatedTrain;
};

// ── DELETE TRAIN ────────────────────────────────────────────

/**
 * Delete a train by ID (hard delete).
 *
 * @param {string} id - Train UUID.
 * @returns {Promise<object>} The deleted train.
 * @throws {NotFoundError} If the train does not exist.
 */
export const deleteTrain = async (id) => {
  // Check that the train exists before attempting deletion
  const existingTrain = await trainRepository.findTrainById(id);
  if (!existingTrain) {
    throw new NotFoundError('Train not found');
  }

  const deletedTrain = await trainRepository.deleteTrain(id);

  return deletedTrain;
};

// ── SEARCH TRAINS (PHASE 4 PART 5) ──────────────────────────

const DAYS_MAP = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

/**
 * Adds minutes to an HH:MM string and returns a Date object based on a reference date.
 */
const combineDateAndTime = (baseDate, timeString, dayOffset = 0) => {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + dayOffset);
  if (timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setUTCHours(hours, minutes, 0, 0); // Assuming times are stored in UTC for simplicity
  }
  return date;
};

/**
 * Calculates duration in minutes between two dates.
 */
const calculateDuration = (start, end) => {
  const diffMs = end - start;
  return Math.floor(diffMs / 60000); // Minutes
};

/**
 * Search for trains between two stations on a specific date.
 *
 * @param {object} query
 * @returns {Promise<{ trains: object[], pagination: object }>}
 */
export const searchTrains = async (query) => {
  const {
    sourceStationId,
    destinationStationId,
    journeyDate,
    page = 1,
    limit = 10,
    sortBy = 'departureTime',
    sortOrder = 'asc',
  } = query;

  if (sourceStationId === destinationStationId) {
    throw new ValidationError('Source and destination stations cannot be the same');
  }

  const reqDate = new Date(journeyDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (reqDate < today) {
    throw new ValidationError('Journey date cannot be in the past');
  }

  // 1. Find all routes that go from source to destination
  const validRoutes = await trainRepository.findRoutesBetweenStations(sourceStationId, destinationStationId);
  
  if (validRoutes.length === 0) {
    return { trains: [], pagination: { currentPage: page, limit, totalRecords: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
  }

  const routeIds = validRoutes.map(r => r.id);

  // 2. Find all active TrainRoutes for these routes
  const activeTrainRoutes = await trainRepository.findActiveTrainsForRoutes(routeIds);

  let results = [];

  // 3. Process each TrainRoute to see if it runs on the correct day
  for (const tr of activeTrainRoutes) {
    const route = validRoutes.find(r => r.id === tr.routeId);
    const sourceStop = route.stops.find(s => s.stationId === sourceStationId);
    const destStop = route.stops.find(s => s.stationId === destinationStationId);

    // Calculate the train's departure date from its ORIGIN station
    const originDepartureDate = new Date(reqDate);
    originDepartureDate.setDate(originDepartureDate.getDate() - sourceStop.dayOffset);

    // Check if the calculated origin date falls within TrainRoute effective dates
    if (tr.effectiveFrom && originDepartureDate < new Date(tr.effectiveFrom)) continue;
    if (tr.effectiveTo && originDepartureDate > new Date(tr.effectiveTo)) continue;

    // Check if the train runs on that day of the week
    const originDayOfWeek = DAYS_MAP[originDepartureDate.getDay()];
    if (!tr.runDays.includes(originDayOfWeek)) continue;

    // 4. Format the result
    const departureDateTime = combineDateAndTime(reqDate, sourceStop.departureTime, 0);
    const arrivalDateTime = combineDateAndTime(reqDate, destStop.arrivalTime, destStop.dayOffset - sourceStop.dayOffset);
    
    results.push({
      trainId: tr.train.id,
      trainNumber: tr.train.trainNumber,
      trainName: tr.train.name,
      trainType: 'EXPRESS', // Placeholder, schema doesn't have trainType
      sourceStation: {
        id: sourceStop.station.id,
        code: sourceStop.station.code,
        name: sourceStop.station.name,
      },
      destinationStation: {
        id: destStop.station.id,
        code: destStop.station.code,
        name: destStop.station.name,
      },
      departureDateTime,
      arrivalDateTime,
      estimatedDuration: calculateDuration(departureDateTime, arrivalDateTime),
      currentStatus: tr.train.status,
    });
  }

  // 5. Sort Results
  results.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    
    if (sortBy === 'departureTime') {
       valA = a.departureDateTime.getTime();
       valB = b.departureDateTime.getTime();
    } else if (sortBy === 'duration') {
       valA = a.estimatedDuration;
       valB = b.estimatedDuration;
    } else if (sortBy === 'trainName') {
       valA = a.trainName.toLowerCase();
       valB = b.trainName.toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 6. Paginate Results
  const totalRecords = results.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const skip = (page - 1) * limit;
  const paginatedResults = results.slice(skip, skip + limit);

  return {
    trains: paginatedResults,
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

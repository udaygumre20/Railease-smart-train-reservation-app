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
import { ConflictError, NotFoundError } from '../../errors/index.js';

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

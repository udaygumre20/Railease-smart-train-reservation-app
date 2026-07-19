// ============================================================
// Seat Service
// Business-logic layer for seat locking, unlocking, and
// availability management. Orchestrates between the seat
// repository and custom error classes.
//
// Rules:
//  • No direct Prisma access – use seat.repository.js
//  • No HTTP concepts (req/res) – those stay in controllers
//  • Throw custom error classes for error conditions
// ============================================================

import * as seatRepository from './seat.repository.js';
import { ConflictError, NotFoundError, ValidationError } from '../../errors/index.js';

// ── Default lock duration: 10 minutes ───────────────────────
const LOCK_DURATION_MS = 10 * 60 * 1000;

// ── LOCK SEAT ──────────────────────────────────────────────

/**
 * Lock one or more seats for a user.
 *
 * @param {object} data
 * @param {string|string[]} data.seatIds   - Single or array of seat IDs
 * @param {string} data.userId
 * @param {string} data.trainId
 * @param {string} data.journeyDate
 * @param {number} [data.durationMs]       - Lock duration in ms
 * @returns {Promise<object>}
 */
export const lockSeats = async (data) => {
  const { seatIds, userId, trainId, journeyDate, durationMs } = data;

  const ids = Array.isArray(seatIds) ? seatIds : [seatIds];

  if (ids.length === 0) {
    throw new ValidationError('At least one seat ID is required');
  }

  if (ids.length > 6) {
    throw new ValidationError('Cannot lock more than 6 seats at once');
  }

  // Validate all seats exist
  for (const seatId of ids) {
    const seat = await seatRepository.findSeatById(seatId);
    if (!seat) {
      throw new NotFoundError(`Seat not found: ${seatId}`);
    }
  }

  const expiresAt = new Date(Date.now() + (durationMs || LOCK_DURATION_MS));
  const journeyDateObj = new Date(journeyDate);

  try {
    if (ids.length === 1) {
      const lock = await seatRepository.lockSeat({
        seatId: ids[0],
        userId,
        trainId,
        journeyDate: journeyDateObj,
        expiresAt,
      });

      // Update availability status
      await seatRepository.updateSeatAvailability(ids[0], trainId, journeyDate, 'LOCKED');

      return { locks: [lock] };
    }

    // Multiple seats — batch lock
    const lockData = ids.map((seatId) => ({
      seatId,
      trainId,
      journeyDate: journeyDateObj,
      expiresAt,
    }));

    const locks = await seatRepository.lockMultipleSeats(lockData, userId);

    // Batch update availability
    const availabilityUpdates = ids.map((seatId) => ({
      seatId,
      trainId,
      journeyDate,
      status: 'LOCKED',
    }));
    await seatRepository.batchUpdateSeatAvailability(availabilityUpdates);

    return { locks };
  } catch (error) {
    if (error.message === 'SEAT_LOCKED_BY_ANOTHER_USER') {
      throw new ConflictError('One or more seats are already locked by another user');
    }
    throw error;
  }
};

// ── UNLOCK SEAT ────────────────────────────────────────────

/**
 * Release a seat lock.
 *
 * @param {string} lockId
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const unlockSeat = async (lockId, userId) => {
  const lock = await seatRepository.findLockById(lockId);

  if (!lock) {
    throw new NotFoundError('Seat lock not found');
  }

  if (lock.userId !== userId) {
    throw new ConflictError('You can only unlock your own seat locks');
  }

  if (!lock.isActive) {
    throw new ConflictError('Seat lock is already released or expired');
  }

  const result = await seatRepository.unlockSeat(lockId, userId);

  // Reset availability to AVAILABLE
  await seatRepository.updateSeatAvailability(
    lock.seatId,
    lock.trainId,
    lock.journeyDate,
    'AVAILABLE'
  );

  return { success: true, released: result.count };
};

// ── GET USER'S ACTIVE LOCKS ────────────────────────────────

/**
 * Get all active seat locks for a user on a journey.
 *
 * @param {string} userId
 * @param {string} trainId
 * @param {string} journeyDate
 * @returns {Promise<object[]>}
 */
export const getUserLocks = async (userId, trainId, journeyDate) => {
  return seatRepository.findActiveLocksForUser(userId, trainId, journeyDate);
};

// ── EXPIRE OLD LOCKS ───────────────────────────────────────

/**
 * Expire all seat locks past their TTL.
 * Should be called by a scheduled job.
 *
 * @returns {Promise<{ count: number }>}
 */
export const expireOldLocks = async () => {
  return seatRepository.expireOldLocks();
};

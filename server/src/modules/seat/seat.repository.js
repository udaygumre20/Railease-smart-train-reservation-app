// ============================================================
// Seat Repository
// Data-access layer for seat locking and availability
// operations. All Prisma queries for seat management live here.
// ============================================================

import prisma from '../../database/client.js';

// ── LOCK SEAT ──────────────────────────────────────────────

/**
 * Lock a seat for a user during the booking window.
 * Uses upsert to handle re-locking after expiry.
 *
 * @param {object} data
 * @param {string} data.seatId
 * @param {string} data.userId
 * @param {string} data.trainId
 * @param {Date}   data.journeyDate
 * @param {Date}   data.expiresAt
 * @returns {Promise<object>} The seat lock record
 */
export const lockSeat = async (data) => {
  return prisma.$transaction(async (tx) => {
    // 1. Check if already locked by another user
    const existingLock = await tx.seatLock.findUnique({
      where: {
        unique_seat_lock_per_journey: {
          seatId: data.seatId,
          trainId: data.trainId,
          journeyDate: data.journeyDate,
        },
      },
    });

    if (existingLock && existingLock.isActive && existingLock.expiresAt > new Date()) {
      if (existingLock.userId !== data.userId) {
        throw new Error('SEAT_LOCKED_BY_ANOTHER_USER');
      }
      // Same user re-locking — extend the lock
      return tx.seatLock.update({
        where: { id: existingLock.id },
        data: {
          expiresAt: data.expiresAt,
          lockedAt: new Date(),
        },
      });
    }

    // 2. Create or update the lock
    return tx.seatLock.upsert({
      where: {
        unique_seat_lock_per_journey: {
          seatId: data.seatId,
          trainId: data.trainId,
          journeyDate: data.journeyDate,
        },
      },
      update: {
        userId: data.userId,
        expiresAt: data.expiresAt,
        isActive: true,
        lockedAt: new Date(),
      },
      create: {
        seatId: data.seatId,
        userId: data.userId,
        trainId: data.trainId,
        journeyDate: data.journeyDate,
        expiresAt: data.expiresAt,
        isActive: true,
      },
    });
  });
};

// ── LOCK MULTIPLE SEATS ────────────────────────────────────

/**
 * Lock multiple seats in a single transaction.
 *
 * @param {object[]} locks - Array of lock data objects
 * @param {string} userId
 * @returns {Promise<object[]>} Array of seat lock records
 */
export const lockMultipleSeats = async (locks, userId) => {
  return prisma.$transaction(
    locks.map((lock) =>
      prisma.seatLock.upsert({
        where: {
          unique_seat_lock_per_journey: {
            seatId: lock.seatId,
            trainId: lock.trainId,
            journeyDate: lock.journeyDate,
          },
        },
        update: {
          userId,
          expiresAt: lock.expiresAt,
          isActive: true,
          lockedAt: new Date(),
        },
        create: {
          seatId: lock.seatId,
          userId,
          trainId: lock.trainId,
          journeyDate: lock.journeyDate,
          expiresAt: lock.expiresAt,
          isActive: true,
        },
      })
    )
  );
};

// ── UNLOCK SEAT ────────────────────────────────────────────

/**
 * Release a seat lock.
 *
 * @param {string} lockId
 * @param {string} userId - Must match the lock owner
 * @returns {Promise<object>}
 */
export const unlockSeat = async (lockId, userId) => {
  return prisma.seatLock.updateMany({
    where: {
      id: lockId,
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });
};

// ── FIND SEAT LOCK ─────────────────────────────────────────

/**
 * Find a seat lock by ID.
 *
 * @param {string} lockId
 * @returns {Promise<object|null>}
 */
export const findLockById = async (lockId) => {
  return prisma.seatLock.findUnique({
    where: { id: lockId },
    include: {
      seat: {
        include: {
          coach: {
            select: { coachNumber: true, trainId: true },
          },
        },
      },
    },
  });
};

// ── FIND ACTIVE LOCKS FOR USER ─────────────────────────────

/**
 * Find all active locks for a user on a specific journey.
 *
 * @param {string} userId
 * @param {string} trainId
 * @param {string} journeyDate
 * @returns {Promise<object[]>}
 */
export const findActiveLocksForUser = async (userId, trainId, journeyDate) => {
  return prisma.seatLock.findMany({
    where: {
      userId,
      trainId,
      journeyDate: new Date(journeyDate),
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    include: {
      seat: {
        select: {
          id: true,
          seatNumber: true,
          seatLabel: true,
          seatType: true,
          position: true,
          coachId: true,
          coach: {
            select: { coachNumber: true },
          },
        },
      },
    },
  });
};

// ── UPDATE SEAT AVAILABILITY ───────────────────────────────

/**
 * Update the availability status for a seat on a journey.
 *
 * @param {string} seatId
 * @param {string} trainId
 * @param {Date} journeyDate
 * @param {string} status - SeatStatus enum value
 * @returns {Promise<object>}
 */
export const updateSeatAvailability = async (seatId, trainId, journeyDate, status) => {
  return prisma.seatAvailability.upsert({
    where: {
      seatId_trainId_journeyDate: {
        seatId,
        trainId,
        journeyDate: new Date(journeyDate),
      },
    },
    update: { status },
    create: {
      seatId,
      trainId,
      journeyDate: new Date(journeyDate),
      status,
    },
  });
};

// ── BATCH UPDATE SEAT AVAILABILITY ─────────────────────────

/**
 * Update availability for multiple seats in a transaction.
 *
 * @param {object[]} updates - Array of { seatId, trainId, journeyDate, status }
 * @returns {Promise<object[]>}
 */
export const batchUpdateSeatAvailability = async (updates) => {
  return prisma.$transaction(
    updates.map((u) =>
      prisma.seatAvailability.upsert({
        where: {
          seatId_trainId_journeyDate: {
            seatId: u.seatId,
            trainId: u.trainId,
            journeyDate: new Date(u.journeyDate),
          },
        },
        update: { status: u.status },
        create: {
          seatId: u.seatId,
          trainId: u.trainId,
          journeyDate: new Date(u.journeyDate),
          status: u.status,
        },
      })
    )
  );
};

// ── EXPIRE OLD LOCKS ───────────────────────────────────────

/**
 * Deactivate all expired seat locks.
 * Should be called periodically by a cron job.
 *
 * @returns {Promise<{ count: number }>}
 */
export const expireOldLocks = async () => {
  return prisma.seatLock.updateMany({
    where: {
      isActive: true,
      expiresAt: { lt: new Date() },
    },
    data: {
      isActive: false,
    },
  });
};

// ── FIND SEAT BY ID ────────────────────────────────────────

/**
 * Find a seat by ID with coach info.
 *
 * @param {string} seatId
 * @returns {Promise<object|null>}
 */
export const findSeatById = async (seatId) => {
  return prisma.seat.findUnique({
    where: { id: seatId },
    include: {
      coach: {
        select: {
          id: true,
          coachNumber: true,
          trainId: true,
          coachType: {
            select: { coachClass: true, layoutType: true },
          },
        },
      },
    },
  });
};

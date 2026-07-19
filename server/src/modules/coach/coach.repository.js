// ============================================================
// Coach Repository
// Data-access layer for coach and layout template operations.
// All Prisma queries for coaches live here.
// ============================================================

import prisma from '../../database/client.js';

// ── FIND COACHES BY TRAIN ──────────────────────────────────

/**
 * Retrieve all coaches for a train, ordered by sequence.
 *
 * @param {string} trainId
 * @returns {Promise<object[]>}
 */
export const findCoachesByTrainId = async (trainId) => {
  return prisma.coach.findMany({
    where: { trainId, isActive: true },
    include: {
      coachType: {
        include: { layoutTemplate: true },
      },
    },
    orderBy: { sequence: 'asc' },
  });
};

// ── FIND COACH BY ID ───────────────────────────────────────

/**
 * Retrieve a single coach by ID with its type and seats.
 *
 * @param {string} coachId
 * @param {object} [options]
 * @param {boolean} [options.includeSeats=false]
 * @returns {Promise<object|null>}
 */
export const findCoachById = async (coachId, options = {}) => {
  return prisma.coach.findUnique({
    where: { id: coachId },
    include: {
      coachType: {
        include: { layoutTemplate: true },
      },
      seats: options.includeSeats
        ? {
            orderBy: { seatNumber: 'asc' },
          }
        : false,
      train: {
        select: { id: true, trainNumber: true, name: true, trainType: true },
      },
    },
  });
};

// ── FIND SEATS FOR COACH ───────────────────────────────────

/**
 * Retrieve all seats for a coach, optionally including availability.
 *
 * @param {string} coachId
 * @param {object} [options]
 * @param {string} [options.trainId]       - Train ID for filtering availability
 * @param {string} [options.journeyDate]   - Journey date for availability
 * @returns {Promise<object[]>}
 */
export const findSeatsByCoachId = async (coachId, options = {}) => {
  const includeAvailability =
    options.trainId && options.journeyDate
      ? {
          availability: {
            where: {
              trainId: options.trainId,
              journeyDate: new Date(options.journeyDate),
            },
          },
        }
      : {};

  return prisma.seat.findMany({
    where: { coachId },
    include: includeAvailability,
    orderBy: { seatNumber: 'asc' },
  });
};

// ── FIND AVAILABLE SEATS ───────────────────────────────────

/**
 * Find available seats in a coach for a specific journey.
 *
 * A seat is considered available if:
 *  - It has no SeatAvailability record for the journey (default = available), OR
 *  - Its SeatAvailability status is AVAILABLE
 *
 * @param {string} coachId
 * @param {string} trainId
 * @param {string} journeyDate
 * @returns {Promise<object[]>}
 */
export const findAvailableSeats = async (coachId, trainId, journeyDate) => {
  const journeyDateObj = new Date(journeyDate);

  return prisma.seat.findMany({
    where: {
      coachId,
      OR: [
        {
          // No availability record → seat is available
          availability: {
            none: {
              trainId,
              journeyDate: journeyDateObj,
            },
          },
        },
        {
          // Explicit AVAILABLE status
          availability: {
            some: {
              trainId,
              journeyDate: journeyDateObj,
              status: 'AVAILABLE',
            },
          },
        },
      ],
    },
    include: {
      availability: {
        where: {
          trainId,
          journeyDate: journeyDateObj,
        },
      },
    },
    orderBy: { seatNumber: 'asc' },
  });
};

// ── SEAT AVAILABILITY COUNT ────────────────────────────────

/**
 * Count available seats for a coach on a specific journey.
 *
 * @param {string} coachId
 * @param {string} trainId
 * @param {string} journeyDate
 * @returns {Promise<{ total: number, available: number, booked: number, rac: number, waitlist: number }>}
 */
export const countSeatAvailability = async (coachId, trainId, journeyDate) => {
  const journeyDateObj = new Date(journeyDate);

  const totalSeats = await prisma.seat.count({ where: { coachId } });

  const statusCounts = await prisma.seatAvailability.groupBy({
    by: ['status'],
    where: {
      seat: { coachId },
      trainId,
      journeyDate: journeyDateObj,
    },
    _count: true,
  });

  const counts = {
    total: totalSeats,
    available: totalSeats, // Start with all available
    booked: 0,
    rac: 0,
    waitlist: 0,
    locked: 0,
    blocked: 0,
  };

  let nonAvailable = 0;
  for (const entry of statusCounts) {
    const count = entry._count;
    switch (entry.status) {
      case 'BOOKED': counts.booked = count; nonAvailable += count; break;
      case 'RAC_STATUS': counts.rac = count; nonAvailable += count; break;
      case 'WAITING': counts.waitlist = count; nonAvailable += count; break;
      case 'LOCKED': counts.locked = count; nonAvailable += count; break;
      case 'SELECTED': nonAvailable += count; break;
      case 'BLOCKED': counts.blocked = count; nonAvailable += count; break;
      default: break;
    }
  }

  counts.available = totalSeats - nonAvailable;

  return counts;
};

// ── CREATE COACH (ADMIN) ───────────────────────────────────

/**
 * Create a new coach and auto-generate its seats from the layout template.
 *
 * @param {object} data
 * @param {string} data.coachNumber
 * @param {string} data.trainId
 * @param {string} data.coachTypeId
 * @param {number} data.sequence
 * @param {number} data.totalSeats
 * @param {object[]} [data.seats] - Optional pre-generated seat definitions
 * @returns {Promise<object>}
 */
export const createCoach = async (data) => {
  const { seats, ...coachData } = data;

  return prisma.coach.create({
    data: {
      ...coachData,
      seats: seats
        ? {
            create: seats.map((s) => ({
              seatNumber: s.seatNumber,
              seatLabel: s.seatLabel,
              seatType: s.seatType,
              position: s.position,
              rowNumber: s.rowNumber,
              columnNumber: s.columnNumber,
              cabin: s.cabin,
              coupe: s.coupe,
              isAccessible: s.isAccessible || false,
              reservedFor: s.reservedFor || 'NONE',
            })),
          }
        : undefined,
    },
    include: {
      coachType: true,
      seats: { orderBy: { seatNumber: 'asc' } },
    },
  });
};

// ── UPDATE COACH (ADMIN) ───────────────────────────────────

/**
 * Update a coach record by ID.
 *
 * @param {string} coachId
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateCoach = async (coachId, data) => {
  return prisma.coach.update({
    where: { id: coachId },
    data,
    include: {
      coachType: true,
    },
  });
};

// ── LAYOUT TEMPLATE OPERATIONS ─────────────────────────────

/**
 * Find all layout templates.
 *
 * @returns {Promise<object[]>}
 */
export const findAllLayoutTemplates = async () => {
  return prisma.layoutTemplate.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
};

/**
 * Find layout template by layout type.
 *
 * @param {string} layoutType
 * @returns {Promise<object|null>}
 */
export const findLayoutTemplateByType = async (layoutType) => {
  return prisma.layoutTemplate.findUnique({
    where: { layoutType },
  });
};

/**
 * Create or update a layout template.
 *
 * @param {object} data
 * @returns {Promise<object>}
 */
export const upsertLayoutTemplate = async (data) => {
  return prisma.layoutTemplate.upsert({
    where: { layoutType: data.layoutType },
    update: {
      name: data.name,
      totalRows: data.totalRows,
      totalColumns: data.totalColumns,
      totalSeats: data.totalSeats,
      seatDefinitions: data.seatDefinitions,
      isActive: data.isActive ?? true,
    },
    create: data,
  });
};

// ── CHECK COACH EXISTS FOR TRAIN ───────────────────────────

/**
 * Check if a coach number already exists for a given train.
 *
 * @param {string} trainId
 * @param {string} coachNumber
 * @returns {Promise<object|null>}
 */
export const findCoachByTrainAndNumber = async (trainId, coachNumber) => {
  return prisma.coach.findUnique({
    where: {
      trainId_coachNumber: {
        trainId,
        coachNumber,
      },
    },
  });
};

// ============================================================
// Booking Repository
// Data-access layer for Booking operations.
// ============================================================

import prisma from '../../database/client.js';

/**
 * Fetch fare details including route stop distances and base fare for a travel class.
 *
 * @param {string} routeId
 * @param {string} sourceStationId
 * @param {string} destStationId
 * @param {string} travelClassCode
 * @returns {Promise<object>}
 */
export const getFareDetails = async (routeId, sourceStationId, destStationId, travelClassCode) => {
  const [sourceStop, destStop, coachType] = await Promise.all([
    prisma.routeStop.findUnique({
      where: { routeId_stationId: { routeId, stationId: sourceStationId } },
      select: { distanceFromOrigin: true },
    }),
    prisma.routeStop.findUnique({
      where: { routeId_stationId: { routeId, stationId: destStationId } },
      select: { distanceFromOrigin: true },
    }),
    prisma.coachType.findUnique({
      where: { code: travelClassCode },
      select: { baseFarePerKm: true },
    }),
  ]);

  return { sourceStop, destStop, coachType };
};

/**
 * Create a new booking along with its passengers.
 *
 * @param {object} bookingData
 * @param {Array<object>} passengersData
 * @returns {Promise<object>}
 */
export const createBooking = async (bookingData, passengersData) => {
  return prisma.$transaction(async (tx) => {
    return tx.booking.create({
      data: {
        ...bookingData,
        passengers: {
          create: passengersData,
        },
      },
      include: {
        passengers: true,
      },
    });
  });
};

/**
 * Find bookings by user ID.
 *
 * @param {string} userId
 * @param {object} params
 * @returns {Promise<Array<object>>}
 */
export const findBookingsByUserId = async (userId, { skip, take, where, orderBy }) => {
  return prisma.booking.findMany({
    where: { userId, ...where },
    skip,
    take,
    orderBy,
    include: {
      train: {
        select: {
          trainNumber: true,
          name: true,
        },
      },
      boardingStation: {
        select: {
          code: true,
          name: true,
        },
      },
      alightingStation: {
        select: {
          code: true,
          name: true,
        },
      },
      passengers: true,
    },
  });
};

/**
 * Count bookings for a user.
 *
 * @param {string} userId
 * @param {object} where
 * @returns {Promise<number>}
 */
export const countBookingsByUserId = async (userId, where) => {
  return prisma.booking.count({
    where: { userId, ...where },
  });
};

/**
 * Find a specific booking by ID, scoped to a user.
 *
 * @param {string} bookingId
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const findBookingById = async (bookingId, userId) => {
  return prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: {
      train: {
        select: {
          trainNumber: true,
          name: true,
        },
      },
      boardingStation: {
        select: {
          code: true,
          name: true,
        },
      },
      alightingStation: {
        select: {
          code: true,
          name: true,
        },
      },
      passengers: true,
    },
  });
};

/**
 * Update the status of a booking.
 *
 * @param {string} bookingId
 * @param {string} status
 * @returns {Promise<object>}
 */
export const updateBookingStatus = async (bookingId, status) => {
  const updateData = { status };
  if (status === 'CANCELLED') {
    updateData.cancelledAt = new Date();
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: updateData,
  });
};

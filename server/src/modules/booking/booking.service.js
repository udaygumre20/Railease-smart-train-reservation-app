// ============================================================
// Booking Service
// Business-logic layer for Booking management operations.
// ============================================================

import * as bookingRepository from './booking.repository.js';
import * as scheduleService from '../schedule/schedule.service.js';
import { socketService } from '../socket/index.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../errors/index.js';

// ── CREATE BOOKING ──────────────────────────────────────────

/**
 * Create a new booking for a user.
 * 
 * @param {string} userId
 * @param {object} data
 * @returns {Promise<object>} Created booking.
 */
export const createBooking = async (userId, data) => {
  const { 
    scheduleId, 
    sourceStationId, 
    destinationStationId, 
    travelClass, 
    journeyDate, 
    quota,
    passengers 
  } = data;

  const totalPassengers = passengers.length;
  if (totalPassengers === 0 || totalPassengers > 6) {
    throw new ValidationError('A booking must have between 1 and 6 passengers');
  }

  // 1. Check Seat Availability (This also validates schedule, stations, date, and sequence)
  const availabilityParams = {
    sourceStationId,
    destinationStationId,
    travelClass,
    journeyDate,
    quota
  };

  const availability = await scheduleService.checkSeatAvailability(scheduleId, availabilityParams);

  if (availability.availableSeats < totalPassengers) {
    throw new ConflictError(`Only ${availability.availableSeats} seats available in this class. Request is for ${totalPassengers} passengers.`);
  }

  // 2. Fetch Fare Details (distance and base fare)
  // We already know schedule exists and is valid from checkSeatAvailability
  const schedule = await scheduleService.getScheduleById(scheduleId);
  const routeId = schedule.routeId;
  const trainId = schedule.trainId;

  const fareDetails = await bookingRepository.getFareDetails(routeId, sourceStationId, destinationStationId, travelClass);
  
  if (!fareDetails.sourceStop || !fareDetails.destStop || !fareDetails.coachType) {
    throw new ValidationError('Failed to calculate fare. Invalid route stops or travel class.');
  }

  // Calculate distance
  const distance = Math.abs(
    Number(fareDetails.destStop.distanceFromOrigin) - Number(fareDetails.sourceStop.distanceFromOrigin)
  );

  // Calculate base fare per passenger
  const baseFarePerPassenger = distance * Number(fareDetails.coachType.baseFarePerKm);
  
  // Calculate total fare
  const totalFare = baseFarePerPassenger * totalPassengers;

  // 3. Create Booking
  const bookingData = {
    userId,
    trainId,
    boardingStationId: sourceStationId,
    alightingStationId: destinationStationId,
    journeyDate: new Date(journeyDate),
    totalPassengers,
    totalFare,
    status: 'PENDING', // As per schema constraints
    quota: quota || 'GENERAL',
    coachPreference: travelClass
  };

  // Map passengers to create inputs
  const passengersData = passengers.map(p => ({
    firstName: p.firstName,
    lastName: p.lastName,
    age: p.age,
    gender: p.gender,
    nationality: p.nationality || 'IN',
    idType: p.idType,
    idNumber: p.idNumber,
    seatPreference: p.seatPreference,
    isLeadPassenger: p.isLeadPassenger || false
  }));

  // Ensure exactly one lead passenger
  const leadCount = passengersData.filter(p => p.isLeadPassenger).length;
  if (leadCount === 0) {
    passengersData[0].isLeadPassenger = true;
  } else if (leadCount > 1) {
    throw new ValidationError('Only one passenger can be the lead passenger');
  }

  return bookingRepository.createBooking(bookingData, passengersData);
};

// ── GET USER BOOKINGS ───────────────────────────────────────

/**
 * Retrieve paginated, filterable list of bookings for a user.
 * 
 * @param {string} userId 
 * @param {object} query 
 * @returns {Promise<object>}
 */
export const getMyBookings = async (userId, query) => {
  const {
    page = 1,
    limit = 10,
    status,
    journeyDate,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const where = {};
  if (status) where.status = status;
  if (journeyDate) {
    // Filter by specific day
    const date = new Date(journeyDate);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    where.journeyDate = {
      gte: date,
      lt: nextDay
    };
  }

  const skip = (page - 1) * limit;

  const [bookings, totalRecords] = await Promise.all([
    bookingRepository.findBookingsByUserId(userId, {
      skip,
      take: limit,
      where,
      orderBy: { [sortBy]: sortOrder },
    }),
    bookingRepository.countBookingsByUserId(userId, where),
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  return {
    bookings,
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

// ── GET BOOKING BY ID ───────────────────────────────────────

/**
 * Retrieve a specific booking by ID, ensuring the user owns it.
 * 
 * @param {string} id 
 * @param {string} userId 
 * @returns {Promise<object>}
 */
export const getBookingById = async (id, userId) => {
  const booking = await bookingRepository.findBookingById(id, userId);
  
  if (!booking) {
    // We check if it exists at all to return 403 or 404
    // But since findBookingById uses userId, it will return null if unauthorized or non-existent
    throw new NotFoundError('Booking not found or you do not have permission to view it');
  }

  return booking;
};

// ── CANCEL BOOKING ──────────────────────────────────────────

/**
 * Cancel a booking.
 * 
 * @param {string} id 
 * @param {string} userId 
 * @returns {Promise<object>}
 */
export const cancelBooking = async (id, userId) => {
  const booking = await bookingRepository.findBookingById(id, userId);
  
  if (!booking) {
    throw new NotFoundError('Booking not found or you do not have permission to modify it');
  }

  if (booking.status === 'CANCELLED') {
    throw new ConflictError('Booking is already cancelled');
  }

  // Only allow cancellation if it's PENDING, CONFIRMED, WAITLISTED, or RAC
  if (['EXPIRED'].includes(booking.status)) {
    throw new ConflictError(`Cannot cancel a booking in ${booking.status} state`);
  }

  // In a real system, we'd also check if the journey date is in the past
  const now = new Date();
  if (booking.journeyDate < now) {
    throw new ConflictError('Cannot cancel a booking for a past journey');
  }

  const updatedBooking = await bookingRepository.updateBookingStatus(id, 'CANCELLED');

  // Emit Socket.IO Events
  try {
    // We can query prisma to find the active schedule for this train.
    const prisma = (await import('../../database/client.js')).default;
    const schedule = await prisma.trainRoute.findFirst({
      where: { trainId: booking.trainId, isActive: true }
    });

    if (schedule) {
      socketService.emitBookingCancelled(schedule.id, {
        bookingId: id,
        status: 'CANCELLED'
      });

      // Recalculate seat availability since it might have freed up
      const params = {
        sourceStationId: booking.boardingStationId,
        destinationStationId: booking.alightingStationId,
        travelClass: booking.coachPreference,
        journeyDate: booking.journeyDate,
        quota: booking.quota
      };

      const availability = await scheduleService.checkSeatAvailability(schedule.id, params);
      socketService.emitSeatAvailabilityUpdated(schedule.id, {
        scheduleId: schedule.id,
        travelClass: params.travelClass,
        totalSeats: availability.totalSeats,
        bookedSeats: availability.bookedSeats,
        availableSeats: availability.availableSeats
      });
    }
  } catch (error) {
    const logger = (await import('../../utils/logger.js')).default;
    logger.error(`Error emitting socket events on booking cancellation: ${error.message}`);
  }

  return updatedBooking;
};

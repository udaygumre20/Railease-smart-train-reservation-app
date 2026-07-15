// ============================================================
// Booking Controller
// Handles HTTP requests for Bookings.
// ============================================================

import * as bookingService from './booking.service.js';
import { sendSuccess, sendCreated } from '../../helpers/response.helper.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * POST /api/v1/bookings
 */
export const createBooking = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const booking = await bookingService.createBooking(userId, req.body);

  return sendCreated(res, { message: 'Booking created successfully', data: { booking } });
});

/**
 * GET /api/v1/bookings
 */
export const getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { bookings, pagination } = await bookingService.getMyBookings(userId, req.query);

  return sendSuccess(res, {
    message: 'Bookings fetched successfully',
    data: { bookings, pagination },
  });
});

/**
 * GET /api/v1/bookings/:bookingId
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const booking = await bookingService.getBookingById(req.params.bookingId, userId);

  return sendSuccess(res, {
    message: 'Booking fetched successfully',
    data: { booking },
  });
});

/**
 * PATCH /api/v1/bookings/:bookingId/cancel
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const booking = await bookingService.cancelBooking(req.params.bookingId, userId);

  return sendSuccess(res, {
    message: 'Booking cancelled successfully',
    data: { booking },
  });
});

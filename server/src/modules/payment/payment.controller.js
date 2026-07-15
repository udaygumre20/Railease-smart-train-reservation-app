import * as paymentService from './payment.service.js';
import { sendCreated, sendSuccess } from '../../helpers/response.helper.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * Creates a new Razorpay payment order for a booking.
 * POST /api/v1/payments/create-order
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const userId = req.user.userId;

  const orderDetails = await paymentService.createPaymentOrder(bookingId, userId);

  return sendCreated(res, {
    message: 'Payment order created successfully',
    data: orderDetails
  });
});

/**
 * Verifies Razorpay payment signature and confirms booking.
 * POST /api/v1/payments/verify
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const userId = req.user.userId;

  const payment = await paymentService.verifyPayment(bookingId, userId, {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });

  return sendSuccess(res, {
    message: 'Payment verified and booking confirmed successfully',
    data: { payment }
  });
});

/**
 * Retrieves payment details for a specific booking.
 * GET /api/v1/payments/bookings/:bookingId
 */
export const getPayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.userId;

  const payment = await paymentService.getPaymentByBooking(bookingId, userId);

  return sendSuccess(res, {
    message: 'Payment details retrieved successfully',
    data: { payment }
  });
});

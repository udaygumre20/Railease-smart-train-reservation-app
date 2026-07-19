import Razorpay from 'razorpay';
import crypto from 'crypto';
import * as paymentRepository from './payment.repository.js';
import * as bookingService from '../booking/booking.service.js';
import * as scheduleService from '../schedule/schedule.service.js';
import { socketService } from '../socket/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../../errors/index.js';

// Initialize Razorpay
// We use optional chaining and fallback to empty string to prevent crashes if keys are not set,
// though in a real scenario, they should be validated at startup.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

/**
 * Creates a Razorpay order and saves a PENDING payment record.
 * 
 * @param {string} bookingId 
 * @param {string} userId 
 * @returns {Promise<object>}
 */
export const createPaymentOrder = async (bookingId, userId) => {
  // 1. Fetch booking and ensure ownership
  const booking = await bookingService.getBookingById(bookingId, userId);

  // 2. Validate booking state
  if (booking.status !== 'PENDING') {
    throw new ConflictError(`Booking is in ${booking.status} state. Payment can only be initiated for PENDING bookings.`);
  }

  // 3. Check if a successful payment already exists
  const existingPayment = await paymentRepository.findPaymentByBookingId(bookingId);
  if (existingPayment && existingPayment.status === 'SUCCESS') {
    throw new ConflictError('Payment has already been successfully processed for this booking.');
  }

  // 4. Create Razorpay order (amount is in paise)
  const amountInPaise = Math.round(Number(booking.totalFare) * 100);
  
  const options = {
    amount: Math.round(booking.totalFare * 100), // in paise
    currency: 'INR',
    receipt: booking.id.substring(0, 40)
  };

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create(options);
  } catch (error) {
    throw new Error(`Razorpay Error: ${error.error?.description || error.message || 'Unknown error'}`);
  }

  // 5. Persist/update payment record
  let payment;
  if (existingPayment) {
    payment = await paymentRepository.verifyAndUpdatePayment(
      existingPayment.id,
      booking.id,
      {
        gatewayOrderId: razorpayOrder.id,
        amount: booking.totalFare,
        status: 'PENDING'
      },
      false // don't confirm booking yet
    );
  } else {
    payment = await paymentRepository.createPaymentRecord({
      bookingId: booking.id,
      amount: booking.totalFare,
      currency: 'INR',
      status: 'PENDING',
      gatewayOrderId: razorpayOrder.id
    });
  }

  return {
    paymentId: payment.id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency
  };
};

/**
 * Verifies Razorpay payment signature and confirms the booking.
 * 
 * @param {string} bookingId 
 * @param {string} userId 
 * @param {object} verificationData
 * @returns {Promise<object>}
 */
export const verifyPayment = async (bookingId, userId, verificationData) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = verificationData;

  // 1. Fetch booking and ensure ownership
  const booking = await bookingService.getBookingById(bookingId, userId);

  // 2. Fetch payment record
  const payment = await paymentRepository.findPaymentByBookingId(bookingId);
  if (!payment) {
    throw new NotFoundError('No payment initiated for this booking.');
  }

  if (payment.status === 'SUCCESS') {
    throw new ConflictError('Payment is already verified and successful.');
  }

  if (payment.gatewayOrderId !== razorpayOrderId) {
    throw new ValidationError('Invalid Razorpay Order ID for this booking.');
  }

  // 3. Verify signature
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  const isAuthentic = expectedSignature === razorpaySignature;

  if (!isAuthentic) {
    // Optionally update payment status to FAILED here
    await paymentRepository.verifyAndUpdatePayment(
      payment.id,
      booking.id,
      {
        status: 'FAILED',
        failureReason: 'Signature verification failed',
        transactionId: razorpayPaymentId
      },
      false
    );
    throw new ValidationError('Invalid payment signature. Payment verification failed.');
  }

  // 4. Update payment and confirm booking atomically
  const updatedPayment = await paymentRepository.verifyAndUpdatePayment(
    payment.id,
    booking.id,
    {
      status: 'SUCCESS',
      transactionId: razorpayPaymentId,
      paidAt: new Date(),
      // Store raw response if needed, for now we just store standard fields
      gatewayResponse: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
    },
    true // this is a success, update booking to CONFIRMED
  );

  // 5. Emit Socket.IO Events
  try {
    // Notify the user of booking confirmation
    socketService.emitBookingConfirmed(booking.userId, {
      bookingId: booking.id,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'SUCCESS'
    });

    // Find the associated schedule for this train and route
    // Note: Since booking has a single journey, we can infer schedule if necessary.
    // Assuming the train has a schedule running on this journey date.
    // For exact seat availability recalculation, we use checkSeatAvailability logic:
    const params = {
      sourceStationId: booking.boardingStationId,
      destinationStationId: booking.alightingStationId,
      travelClass: booking.coachPreference,
      journeyDate: booking.journeyDate,
      quota: booking.quota
    };

    // To emit seat updates, we need the scheduleId. 
    // We can query prisma to find the active schedule for this train.
    const prisma = (await import('../../database/client.js')).default;
    const schedule = await prisma.trainRoute.findFirst({
      where: { trainId: booking.trainId, isActive: true }
    });

    if (schedule) {
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
    // Do not throw on socket emission errors, just log it so payment is not rolled back
    const logger = (await import('../../utils/logger.js')).default;
    logger.error(`Error emitting socket events on payment success: ${error.message}`);
  }

  return updatedPayment;
};

/**
 * Retrieves payment details for a specific booking.
 * 
 * @param {string} bookingId 
 * @param {string} userId 
 * @returns {Promise<object>}
 */
export const getPaymentByBooking = async (bookingId, userId) => {
  // Ensure ownership
  await bookingService.getBookingById(bookingId, userId);

  const payment = await paymentRepository.findPaymentByBookingId(bookingId);
  
  if (!payment) {
    throw new NotFoundError('Payment not found for this booking.');
  }

  return payment;
};

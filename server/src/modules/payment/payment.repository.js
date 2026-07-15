import prisma from '../../database/client.js';

/**
 * Creates a payment record linked to a booking.
 * 
 * @param {object} paymentData 
 * @returns {Promise<object>}
 */
export const createPaymentRecord = async (paymentData) => {
  return prisma.payment.create({
    data: paymentData
  });
};

/**
 * Retrieves a payment record by booking ID.
 * 
 * @param {string} bookingId 
 * @returns {Promise<object>}
 */
export const findPaymentByBookingId = async (bookingId) => {
  return prisma.payment.findUnique({
    where: { bookingId },
    include: {
      booking: true
    }
  });
};

/**
 * Updates a payment and corresponding booking in an atomic transaction.
 * 
 * @param {string} paymentId 
 * @param {string} bookingId
 * @param {object} paymentUpdateData 
 * @param {boolean} isSuccess 
 * @returns {Promise<object>}
 */
export const verifyAndUpdatePayment = async (paymentId, bookingId, paymentUpdateData, isSuccess) => {
  return prisma.$transaction(async (tx) => {
    // 1. Update Payment status
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: paymentUpdateData
    });

    // 2. If successful, update the booking status to CONFIRMED
    if (isSuccess) {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' }
      });
    }

    return payment;
  });
};

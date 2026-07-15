import { z } from 'zod';

export const createOrderSchema = {
  body: z.object({
    bookingId: z.string().uuid({ message: 'Invalid booking ID format' }),
  }),
};

export const verifyPaymentSchema = {
  body: z.object({
    bookingId: z.string().uuid({ message: 'Invalid booking ID format' }),
    razorpayOrderId: z.string({ required_error: 'Razorpay Order ID is required' }),
    razorpayPaymentId: z.string({ required_error: 'Razorpay Payment ID is required' }),
    razorpaySignature: z.string({ required_error: 'Razorpay Signature is required' }),
  }),
};

export const paymentParamsSchema = {
  params: z.object({
    bookingId: z.string().uuid({ message: 'Invalid booking ID format' }),
  }),
};

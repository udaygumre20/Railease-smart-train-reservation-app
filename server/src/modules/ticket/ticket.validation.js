import { z } from 'zod';

export const ticketParamsSchema = {
  params: z.object({
    bookingId: z.string().uuid({ message: 'Invalid booking ID format' }),
  }),
};

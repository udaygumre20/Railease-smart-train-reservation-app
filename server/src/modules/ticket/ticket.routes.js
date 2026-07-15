import { Router } from 'express';
import * as ticketController from './ticket.controller.js';
import { ticketParamsSchema } from './ticket.validation.js';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/auth.middleware.js';

const router = Router();

// Protect all ticket routes with authentication
router.use(authenticate);

// We assume these routes will be mounted under /api/v1/bookings
// So the full path becomes /api/v1/bookings/:bookingId/ticket
router.get(
  '/:bookingId/ticket',
  validate(ticketParamsSchema),
  ticketController.downloadTicket
);

router.post(
  '/:bookingId/resend-ticket',
  validate(ticketParamsSchema),
  ticketController.resendTicketEmail
);

export default router;

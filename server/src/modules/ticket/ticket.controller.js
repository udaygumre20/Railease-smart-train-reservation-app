import * as ticketService from './ticket.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * @desc    Download the electronic ticket as PDF
 * @route   GET /api/v1/bookings/:bookingId/ticket
 * @access  Private (Owner only)
 */
export const downloadTicket = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.userId;

  const { pdfBuffer, booking } = await ticketService.generateTicketPDF(bookingId, userId);

  const pnr = booking.pnr?.pnrNumber || 'N_A';
  const filename = `RailEase_Ticket_${pnr}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', pdfBuffer.length);

  return res.end(pdfBuffer);
});

/**
 * @desc    Resend ticket confirmation email
 * @route   POST /api/v1/bookings/:bookingId/resend-ticket
 * @access  Private (Owner only)
 */
export const resendTicketEmail = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.userId;

  const emailResult = await ticketService.sendTicketEmail(bookingId, userId);

  return res.status(200).json({
    success: true,
    message: 'Ticket email successfully sent.',
    data: {
      previewUrl: emailResult.previewUrl
    }
  });
});

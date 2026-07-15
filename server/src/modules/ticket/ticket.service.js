import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import prisma from '../../database/client.js';
import { NotFoundError, AppError } from '../../errors/index.js';
import { format } from 'util';

/**
 * Helper to generate a PDF buffer using PDFKit.
 * @param {Object} booking - The fully populated booking record.
 * @returns {Promise<Buffer>} The PDF Buffer.
 */
const createPDFBuffer = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // 1. Header / Branding
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('RAILEASE', { align: 'center' })
        .moveDown(0.2);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Electronic Reservation Slip (ERS)', { align: 'center', color: 'grey' })
        .moveDown(2);

      // 2. Ticket Info Box
      const pnrNumber = booking.pnr?.pnrNumber || 'N/A';
      const ticketNumber = booking.pnr?.pnrNumber || booking.id.substring(0, 8).toUpperCase();
      
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Booking Details')
        .moveDown(0.5);

      doc.font('Helvetica').fontSize(10);
      doc.text(`PNR Number: ${pnrNumber}`);
      doc.text(`Ticket Number: ${ticketNumber}`);
      doc.text(`Transaction ID: ${booking.payment?.transactionId || 'N/A'}`);
      doc.text(`Booking Date: ${new Date(booking.bookingDate).toLocaleString()}`);
      doc.text(`Class/Quota: ${booking.coachPreference || 'SL'} / ${booking.quota}`);
      doc.moveDown(1.5);

      // 3. Journey Details
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Journey Details')
        .moveDown(0.5);

      doc.font('Helvetica').fontSize(10);
      doc.text(`Train: ${booking.train.trainNumber} - ${booking.train.name}`);
      doc.text(`From: ${booking.boardingStation.name} (${booking.boardingStation.code})`);
      doc.text(`To: ${booking.alightingStation.name} (${booking.alightingStation.code})`);
      doc.text(`Journey Date: ${new Date(booking.journeyDate).toLocaleDateString()}`);
      doc.moveDown(1.5);

      // 4. Passenger Details
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Passenger Details')
        .moveDown(0.5);

      // Table Header
      let y = doc.y;
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Name', 50, y);
      doc.text('Age', 200, y);
      doc.text('Gender', 250, y);
      doc.text('Coach/Seat/Status', 320, y);
      doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
      doc.moveDown(1);

      // Table Rows
      doc.font('Helvetica').fontSize(10);
      booking.passengers.forEach((passenger) => {
        y = doc.y;
        
        // Find ticket info if it exists
        const ticket = passenger.ticket;
        let seatInfo = 'CNF'; // Base status
        if (ticket) {
          seatInfo = `${ticket.status} / ${ticket.coachNumber}-${ticket.seatNumber} (${ticket.seatType})`;
        } else {
          // If no specific ticket record (e.g. general unreserved), just show status
          seatInfo = booking.status;
        }

        doc.text(`${passenger.firstName} ${passenger.lastName}`, 50, y);
        doc.text(`${passenger.age}`, 200, y);
        doc.text(`${passenger.gender}`, 250, y);
        doc.text(seatInfo, 320, y);
        doc.moveDown(0.5);
      });
      doc.moveDown(1.5);

      // 5. Payment Details
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Payment Details', 50)
        .moveDown(0.5);

      doc.font('Helvetica').fontSize(10);
      doc.text(`Total Fare: INR ${booking.totalFare}`);
      doc.text(`Payment Status: ${booking.payment?.status || 'N/A'}`);
      doc.moveDown(3);

      // 6. Footer
      doc
        .fontSize(8)
        .font('Helvetica-Oblique')
        .text('This is a computer-generated document and does not require a signature.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Validates a booking for ticket generation and returns the populated booking.
 */
const getValidBookingForTicket = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      train: true,
      boardingStation: true,
      alightingStation: true,
      passengers: {
        include: {
          ticket: true
        }
      },
      payment: true,
      pnr: true,
      user: {
        select: {
          firstName: true,
          email: true
        }
      }
    }
  });

  if (!booking || booking.userId !== userId) {
    throw new NotFoundError('Booking not found or you do not have permission to view it');
  }

  if (booking.status !== 'CONFIRMED') {
    throw new AppError(`Cannot generate ticket. Booking status is ${booking.status}`, 400);
  }

  if (!booking.payment || booking.payment.status !== 'SUCCESS') {
    throw new AppError(`Cannot generate ticket. Payment status is ${booking.payment?.status || 'PENDING'}`, 400);
  }

  return booking;
};

/**
 * Generates the PDF ticket buffer.
 */
export const generateTicketPDF = async (bookingId, userId) => {
  const booking = await getValidBookingForTicket(bookingId, userId);
  const pdfBuffer = await createPDFBuffer(booking);
  return { pdfBuffer, booking };
};

/**
 * Sends the ticket email using Nodemailer and Ethereal.
 */
export const sendTicketEmail = async (bookingId, userId) => {
  const { pdfBuffer, booking } = await generateTicketPDF(bookingId, userId);

  // For development/testing, we use ethereal.email.
  // In production, configure SMTP via ENV variables.
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  const pnr = booking.pnr?.pnrNumber || 'N/A';
  const journeyDate = new Date(booking.journeyDate).toLocaleDateString();

  const mailOptions = {
    from: '"RailEase Auto-Mailer" <noreply@railease.com>',
    to: booking.user.email,
    subject: `RailEase: Ticket Confirmation - PNR ${pnr}`,
    text: `Dear ${booking.user.firstName},\n\nYour booking is confirmed! PNR: ${pnr}.\nTrain: ${booking.train.trainNumber} - ${booking.train.name}\nJourney Date: ${journeyDate}\n\nPlease find your E-Ticket attached as a PDF.\n\nThank you for choosing RailEase.`,
    html: `
      <h3>Dear ${booking.user.firstName},</h3>
      <p>Your booking is <strong>CONFIRMED</strong>!</p>
      <ul>
        <li><strong>PNR:</strong> ${pnr}</li>
        <li><strong>Train:</strong> ${booking.train.trainNumber} - ${booking.train.name}</li>
        <li><strong>Date:</strong> ${journeyDate}</li>
        <li><strong>From:</strong> ${booking.boardingStation.name}</li>
        <li><strong>To:</strong> ${booking.alightingStation.name}</li>
      </ul>
      <p>Please find your E-Ticket attached as a PDF.</p>
      <br>
      <p>Thank you for choosing RailEase.</p>
    `,
    attachments: [
      {
        filename: `RailEase_Ticket_${pnr}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  const info = await transporter.sendMail(mailOptions);
  
  // Return the ethereal email URL so the user can preview it locally
  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info)
  };
};

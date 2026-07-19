import { getSocketIo } from './socket.server.js';
import logger from '../../utils/logger.js';

/**
 * Emit an event to a specific room.
 * 
 * @param {string} roomName 
 * @param {string} eventName 
 * @param {object} payload 
 */
const emitToRoom = (roomName, eventName, payload) => {
  try {
    const io = getSocketIo();
    io.to(roomName).emit(eventName, payload);
    logger.info(`Emitted ${eventName} to ${roomName}`);
  } catch (error) {
    logger.error(`Failed to emit ${eventName} to ${roomName}: ${error.message}`);
  }
};

/**
 * Emits the bookingConfirmed event to the specific user's socket room.
 * 
 * @param {string} userId 
 * @param {object} payload - Should contain { bookingId, bookingStatus, paymentStatus }
 */
export const emitBookingConfirmed = (userId, payload) => {
  emitToRoom(`user:${userId}`, 'bookingConfirmed', payload);
};

/**
 * Broadcasts the seatAvailabilityUpdated event to the schedule room.
 * 
 * @param {string} scheduleId 
 * @param {object} payload - Should contain { scheduleId, travelClass, totalSeats, bookedSeats, availableSeats }
 */
export const emitSeatAvailabilityUpdated = (scheduleId, payload) => {
  emitToRoom(`schedule:${scheduleId}`, 'seatAvailabilityUpdated', payload);
};

/**
 * Broadcasts the bookingCancelled event to the schedule room.
 * 
 * @param {string} scheduleId 
 * @param {object} payload 
 */
export const emitBookingCancelled = (scheduleId, payload) => {
  emitToRoom(`schedule:${scheduleId}`, 'bookingCancelled', payload);
};

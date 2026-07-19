import { Server } from 'socket.io';
import { verifyAccessToken } from '../../helpers/token.helper.js';
import logger from '../../utils/logger.js';

let io;

/**
 * Validates a JWT token for Socket.IO connections.
 * 
 * @param {object} socket 
 * @param {Function} next 
 */
const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication Error: Token missing'));
    }

    const decoded = verifyAccessToken(token);
    socket.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    logger.error(`Socket Auth Error: ${error.message}`);
    return next(new Error('Authentication Error: Invalid or expired token'));
  }
};

/**
 * Initializes the Socket.IO server.
 * 
 * @param {import('http').Server} httpServer 
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user.userId})`);

    // Automatically join a user-specific room
    socket.join(`user:${socket.user.userId}`);

    // ── Schedule Room Events ──────────────────────────────────────────────

    socket.on('join:schedule', (payload) => {
      if (!payload || !payload.scheduleId) {
        return socket.emit('error', { message: 'Schedule ID is required' });
      }
      const roomName = `schedule:${payload.scheduleId}`;
      socket.join(roomName);
      logger.info(`User ${socket.user.userId} joined room ${roomName}`);
    });

    socket.on('leave:schedule', (payload) => {
      if (!payload || !payload.scheduleId) {
        return socket.emit('error', { message: 'Schedule ID is required' });
      }
      const roomName = `schedule:${payload.scheduleId}`;
      socket.leave(roomName);
      logger.info(`User ${socket.user.userId} left room ${roomName}`);
    });

    // ── Disconnection ─────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id} (User: ${socket.user.userId})`);
      // Cleanup is handled automatically by Socket.io
    });
  });

  return io;
};

/**
 * Returns the initialized io instance.
 * @throws {Error} If io is not initialized.
 * @returns {Server}
 */
export const getSocketIo = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initializeSocket first.');
  }
  return io;
};

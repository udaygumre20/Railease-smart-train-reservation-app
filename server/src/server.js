// ============================================================
// Server Bootstrap
// Connects to the database and starts the Express HTTP server.
// Includes graceful shutdown handling for SIGTERM/SIGINT.
// ============================================================

import app from './app.js';
import { env } from './config/index.js';
import { connectDB, disconnectDB } from './database/connection.js';
import { initializeSocket } from './modules/socket/index.js';
import { initSeatLockJob, stopSeatLockJob } from './jobs/seatLock.job.js';
import logger from './utils/logger.js';

const startServer = async () => {
  try {
    // 1. Connect to PostgreSQL via Prisma
    await connectDB();

    // 2. Start Express HTTP server
    const server = app.listen(env.port, () => {
      logger.info(`🚂 RailEase API server running on port ${env.port}`);
      logger.info(`📍 Environment: ${env.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${env.port}/api/v1/health`);
    });

    // 3. Initialize Socket.IO
    initializeSocket(server);

    // 4. Initialize Cron Jobs
    initSeatLockJob();

    // ── Graceful Shutdown ─────────────────────────────────
    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        logger.info('🔒 HTTP server closed');
        stopSeatLockJob();
        await disconnectDB();
        logger.info('👋 Process exiting');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

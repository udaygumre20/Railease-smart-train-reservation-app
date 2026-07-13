// ============================================================
// Database Connection
// Establishes the Prisma connection with error handling.
// ============================================================

import prisma from './client.js';
import logger from '../utils/logger.js';

/**
 * Connect to the PostgreSQL database via Prisma.
 * Exits the process on connection failure.
 */
const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Gracefully disconnect from the database.
 */
const disconnectDB = async () => {
  await prisma.$disconnect();
  logger.info('🔌 Database disconnected');
};

export { connectDB, disconnectDB };

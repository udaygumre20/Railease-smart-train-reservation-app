// ============================================================
// Seat Lock Cleanup Job
// Periodically expires old seat locks using node-cron.
// ============================================================

import cron from 'node-cron';
import logger from '../utils/logger.js';
import * as seatService from '../modules/seat/seat.service.js';

let lockExpiryJob = null;

/**
 * Initializes the seat lock expiry cron job.
 * Runs every minute to clear out expired locks.
 */
export const initSeatLockJob = () => {
  // Check if job is already running to avoid duplicate instances
  if (lockExpiryJob) {
    logger.warn('Seat lock job is already running');
    return;
  }

  // Run every minute: * * * * *
  lockExpiryJob = cron.schedule('* * * * *', async () => {
    try {
      logger.debug('Running scheduled task: expireOldLocks');
      const result = await seatService.expireOldLocks();
      
      if (result.count > 0) {
        logger.info(`Expired ${result.count} old seat locks successfully.`);
      }
    } catch (error) {
      logger.error('Failed to expire old seat locks during scheduled job:', error);
    }
  });

  logger.info('Scheduled job initialized: Seat Lock Expiry (runs every minute)');
};

/**
 * Stops the seat lock expiry cron job.
 */
export const stopSeatLockJob = () => {
  if (lockExpiryJob) {
    lockExpiryJob.stop();
    lockExpiryJob = null;
    logger.info('Stopped scheduled job: Seat Lock Expiry');
  }
};

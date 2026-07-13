// ============================================================
// Prisma Transaction Helper
// Reusable wrapper for Prisma interactive transactions.
// ============================================================

import prisma from './client.js';

/**
 * Execute a callback within a Prisma interactive transaction.
 *
 * @param {Function} callback - Async function receiving the transaction client (tx).
 * @param {object}   [options] - Transaction options.
 * @param {number}   [options.maxWait=5000] - Max wait time to acquire a connection (ms).
 * @param {number}   [options.timeout=10000] - Max transaction execution time (ms).
 * @returns {Promise<*>} The return value of the callback.
 *
 * @example
 * const result = await withTransaction(async (tx) => {
 *   const user = await tx.user.create({ data: { ... } });
 *   const booking = await tx.booking.create({ data: { ... } });
 *   return { user, booking };
 * });
 */
const withTransaction = async (callback, options = {}) => {
  const { maxWait = 5000, timeout = 10000 } = options;

  return prisma.$transaction(callback, {
    maxWait,
    timeout,
  });
};

export { withTransaction };

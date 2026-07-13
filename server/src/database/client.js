// ============================================================
// Prisma Client Singleton
// Prevents connection pool exhaustion during hot-reloads in
// development by caching the client on the global object.
// ============================================================

import { PrismaClient } from '@prisma/client';
import { env } from '../config/index.js';

/** @type {PrismaClient} */
let prisma;

if (env.isProduction) {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  // In development, reuse the client across hot-reloads
  if (!globalThis.__prismaClient) {
    globalThis.__prismaClient = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = globalThis.__prismaClient;
}

export default prisma;

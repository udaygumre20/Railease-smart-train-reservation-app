// ============================================================
// User Role Constants
// Mirrors the Prisma Role enum for authorization logic.
// ============================================================

export const ROLES = Object.freeze({
  USER: 'USER',
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
});

/**
 * Array of all valid roles.
 * Useful for validation and authorization checks.
 */
export const ALL_ROLES = Object.values(ROLES);

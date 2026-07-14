// ============================================================
// Auth Utilities
// Pure helper functions used exclusively by the auth module.
//
// Re-exports from the global helpers (token, hash) so that all
// auth-related imports can be resolved within the module.
// Additional auth-only utilities (e.g., sanitizeUser) live here
// to keep the service layer clean.
// ============================================================

import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../helpers/token.helper.js';

import {
  hashPassword,
  comparePassword,
} from '../../helpers/hash.helper.js';

// ── RE-EXPORT TOKEN & HASH UTILITIES ────────────────────────
// Allows auth service to import from './auth.utils.js' instead
// of reaching into shared helpers, keeping module boundaries clean.

export {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
};

// ── SANITIZE USER ───────────────────────────────────────────

/**
 * Remove sensitive fields from a user record before returning
 * to the client. Always strip password and refreshToken.
 *
 * @param {object} user - Raw user object from the database.
 * @returns {object} Sanitized user object.
 */
export const sanitizeUser = (user) => {
  const { password, refreshToken, ...safeUser } = user;
  return safeUser;
};

// ── SPLIT FULL NAME ─────────────────────────────────────────

/**
 * Split a "fullName" string into firstName and lastName.
 * If only one word is provided, lastName defaults to ''.
 *
 * @param {string} fullName
 * @returns {{ firstName: string, lastName: string }}
 */
export const splitFullName = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

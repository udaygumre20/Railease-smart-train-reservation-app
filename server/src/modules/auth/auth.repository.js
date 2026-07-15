// ============================================================
// Auth Repository
// Data-access layer for authentication-related database
// operations. All Prisma queries for auth live here – services
// call repository methods rather than touching Prisma directly.
// This keeps business logic free of ORM coupling and makes
// unit-testing straightforward via dependency injection.
// ============================================================

import prisma from '../../database/client.js';

/**
 * Fields to return when selecting a user for auth responses.
 * Excludes sensitive data (password, refresh token) by default.
 */
const USER_SAFE_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  avatar: true,
  isVerified: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

// ── CREATE USER ─────────────────────────────────────────────

/**
 * Insert a new user record into the database.
 *
 * @param {object} data - User creation payload.
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {string} data.email
 * @param {string} data.password - Already-hashed password.
 * @param {string|null} [data.phone]
 * @returns {Promise<object>} The created user record.
 *
 * @todo Phase 3 Part 3 – implement full creation logic.
 */
export const createUser = async (data) => {
  return prisma.user.create({
    data,
  });
};

// ── FIND USER BY EMAIL ──────────────────────────────────────

/**
 * Look up a single user by their email address.
 * Returns the FULL record (including password & refreshToken)
 * so the service layer can verify credentials.
 *
 * @param {string} email
 * @returns {Promise<object|null>} User record or null if not found.
 *
 * @todo Phase 3 Part 3 – implement full lookup logic.
 */
export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

// ── FIND USER BY ID ─────────────────────────────────────────

/**
 * Look up a single user by their primary key (UUID).
 * Returns a safe subset of fields by default (no password).
 *
 * @param {string}  id
 * @param {object}  [options]
 * @param {boolean} [options.includeSensitive=false] - Include password & refreshToken.
 * @returns {Promise<object|null>} User record or null if not found.
 *
 * @todo Phase 3 Part 3 – implement full lookup logic.
 */
export const findUserById = async (id, options = {}) => {
  return prisma.user.findUnique({
    where: { id },
    select: options.includeSensitive ? undefined : USER_SAFE_SELECT,
  });
};

// ── UPDATE REFRESH TOKEN ────────────────────────────────────

/**
 * Persist a new refresh token (or null to revoke) for a user.
 * Called during login, token rotation, and logout flows.
 *
 * @param {string}      userId
 * @param {string|null} refreshToken - New token or null to revoke.
 * @returns {Promise<object>} Updated user record.
 *
 * @todo Phase 3 Part 3 – implement token persistence.
 */
export const updateRefreshToken = async (userId, refreshToken) => {
  return prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
  });
};

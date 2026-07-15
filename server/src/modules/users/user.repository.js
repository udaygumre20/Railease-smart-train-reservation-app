// ============================================================
// User Repository
// Data-access layer for user-related database operations.
// All Prisma queries that deal with user records (outside of
// the authentication flow) live here.
//
// Auth-specific queries (e.g., updateRefreshToken) belong in
// auth.repository.js. This repository handles profile-oriented
// operations like fetching user details, updating profiles, etc.
// ============================================================

import prisma from '../../database/client.js';

/**
 * Fields returned for safe public user responses.
 * Excludes password and refreshToken.
 */
const USER_SAFE_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
  role: true,
  avatar: true,
  isVerified: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

// ── FIND USER BY ID ─────────────────────────────────────────

/**
 * Retrieve a user by primary key (UUID) with safe field selection.
 *
 * @param {string} id - User UUID.
 * @returns {Promise<object|null>} Sanitized user or null.
 *
 * @todo Phase 3 Part 3 – implement lookup logic.
 */
export const findById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: USER_SAFE_SELECT,
  });
};

// ── FIND USER BY EMAIL ──────────────────────────────────────

/**
 * Retrieve a user by email address with safe field selection.
 *
 * @param {string} email
 * @returns {Promise<object|null>} Sanitized user or null.
 *
 * @todo Phase 3 Part 3 – implement lookup logic.
 */
export const findByEmail = async (email) => {
  // TODO: Implement in Phase 3 Part 3
  throw new Error('findByEmail not implemented yet');
};

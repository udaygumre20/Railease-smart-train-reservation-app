// ============================================================
// User Service
// Business logic for user-related operations that are NOT part
// of the authentication flow.
//
// The auth module's getCurrentUser controller delegates here to
// retrieve the user profile, keeping a clean separation between
// "auth" (register/login/tokens) and "user" (profiles/settings).
// ============================================================

import * as userRepository from './user.repository.js';
import { NotFoundError } from '../../errors/index.js';

// ── GET USER BY ID ──────────────────────────────────────────

/**
 * Retrieve a user's profile by their ID.
 *
 * @param {string} userId
 * @returns {Promise<object>} Sanitized user object.
 * @throws {NotFoundError} If user does not exist.
 *
 * @todo Phase 3 Part 3 – implement full retrieval logic.
 */
export const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

// ── GET USER BY EMAIL ───────────────────────────────────────

/**
 * Retrieve a user's profile by their email.
 *
 * @param {string} email
 * @returns {Promise<object>} Sanitized user object.
 * @throws {NotFoundError} If user does not exist.
 *
 * @todo Phase 3 Part 3 – implement full retrieval logic.
 */
export const getUserByEmail = async (email) => {
  // TODO: Implement in Phase 3 Part 3
  throw new Error('getUserByEmail not implemented yet');
};

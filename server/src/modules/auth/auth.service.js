// ============================================================
// Auth Service
// Business-logic layer for authentication operations.
// Controllers delegate here – this module orchestrates between
// the auth repository, token helpers, and hash helpers.
//
// Rules:
//  • No direct Prisma access – use auth.repository.js
//  • No HTTP concepts (req/res) – those stay in controllers
//  • Throw custom error classes for error conditions
// ============================================================

import * as authRepository from './auth.repository.js';
import { hashPassword, comparePassword, generateTokenPair, sanitizeUser } from './auth.utils.js';
import { ConflictError, AuthenticationError } from '../../errors/index.js';

// ── REGISTER USER ───────────────────────────────────────────

/**
 * Register a new user account.
 *
 * Flow:
 *  1. Check for duplicate email
 *  2. Hash password
 *  3. Create user record
 *  4. Return created user
 *
 * @param {object} data
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} [data.phone]
 * @returns {Promise<object>}
 */
export const registerUser = async (data) => {
  const { firstName, lastName, email, password, phone } = data;

  // 1. Check if email already exists
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // 2. Hash password
  const hashedPassword = await hashPassword(password);

  // 3. Save user
  const user = await authRepository.createUser({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
  });

  // 4. Remove password before returning response
  const { password: _, refreshToken, ...safeUser } = user;

  return safeUser;
};

// ── LOGIN USER ──────────────────────────────────────────────

/**
 * Authenticate a user with email & password.
 *
 * Flow:
 *  1. Find user by email
 *  2. Verify account is active
 *  3. Compare password hash
 *  4. Generate token pair
 *  5. Update refresh token & last login timestamp
 *
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 *
 * @todo Phase 3 Part 3 – implement login logic.
 */
export const loginUser = async (data) => {
  const { email, password } = data;

  // 1. Find user by email
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // 2. Verify account is active
  if (!user.isActive) {
    throw new AuthenticationError('Your account has been deactivated. Please contact support.');
  }

  // 3. Compare password hash
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // 4. Generate token pair (access + refresh)
  const { accessToken, refreshToken } = generateTokenPair(user);

  // 5. Store refresh token in database
  await authRepository.updateRefreshToken(user.id, refreshToken);

  // 6. Remove sensitive fields before returning
  const safeUser = sanitizeUser(user);

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

// ── LOGOUT USER ─────────────────────────────────────────────

/**
 * Log out a user by revoking their stored refresh token.
 *
 * @param {string} userId - The authenticated user's ID.
 * @returns {Promise<void>}
 *
 * @todo Phase 3 Part 3 – implement logout logic.
 */
export const logoutUser = async (userId) => {
  // TODO: Implement in Phase 3 Part 3
  throw new Error('logoutUser not implemented yet');
};

// ── REFRESH ACCESS TOKEN ────────────────────────────────────

/**
 * Issue a new access token using a valid refresh token.
 * Implements token rotation for added security.
 *
 * Flow:
 *  1. Verify refresh token signature
 *  2. Look up user and compare stored token
 *  3. Detect token reuse (possible theft)
 *  4. Generate new token pair
 *  5. Persist rotated refresh token
 *
 * @param {string} token - The refresh token (from HTTP-only cookie).
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 *
 * @todo Phase 3 Part 3 – implement token refresh logic.
 */
export const refreshAccessToken = async (token) => {
  // TODO: Implement in Phase 3 Part 3
  throw new Error('refreshAccessToken not implemented yet');
};

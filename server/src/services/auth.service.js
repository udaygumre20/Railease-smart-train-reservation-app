// ============================================================
// Authentication Service
// Contains all business logic for authentication operations.
// Controllers remain thin – they delegate everything here.
// ============================================================

import prisma from '../database/client.js';
import { hashPassword, comparePassword } from '../helpers/hash.helper.js';
import { generateTokenPair, verifyRefreshToken } from '../helpers/token.helper.js';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../errors/index.js';

/**
 * Sanitize user object – removes sensitive fields before returning.
 *
 * @param {object} user - Raw Prisma user object.
 * @returns {object} Sanitized user without password or refresh token.
 */
const sanitizeUser = (user) => {
  const { password, refreshToken, ...safeUser } = user;
  return safeUser;
};

/**
 * Split a full name into firstName and lastName.
 * If only one word is provided, lastName defaults to empty string.
 *
 * @param {string} fullName
 * @returns {{ firstName: string, lastName: string }}
 */
const splitFullName = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

// ── REGISTER ────────────────────────────────────────────────

/**
 * Register a new user.
 *
 * @param {object} data
 * @param {string} data.fullName
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.phone
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 * @throws {ConflictError} If email or phone already exists.
 */
export const register = async ({ fullName, email, password, phone }) => {
  // 1. Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  // 2. Check if phone already exists (phone is optional but unique)
  if (phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      throw new ConflictError('An account with this phone number already exists');
    }
  }

  // 3. Hash password
  const hashedPassword = await hashPassword(password);

  // 4. Split full name
  const { firstName, lastName } = splitFullName(fullName);

  // 5. Create user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone || null,
    },
  });

  // 6. Generate token pair
  const { accessToken, refreshToken } = generateTokenPair(user);

  // 7. Store refresh token in database
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

// ── LOGIN ───────────────────────────────────────────────────

/**
 * Authenticate a user with email and password.
 *
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 * @throws {AuthenticationError} If credentials are invalid.
 */
export const login = async ({ email, password }) => {
  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // 2. Check if account is active
  if (!user.isActive) {
    throw new AuthenticationError('Your account has been deactivated. Please contact support.');
  }

  // 3. Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // 4. Generate token pair
  const { accessToken, refreshToken } = generateTokenPair(user);

  // 5. Update refresh token and last login timestamp
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken,
      lastLoginAt: new Date(),
    },
  });

  return {
    user: sanitizeUser(updatedUser),
    accessToken,
    refreshToken,
  };
};

// ── REFRESH TOKEN ───────────────────────────────────────────

/**
 * Generate a new access token using a valid refresh token.
 *
 * @param {string} token - The refresh token (from cookie).
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 * @throws {AuthenticationError} If refresh token is invalid or revoked.
 */
export const refreshAccessToken = async (token) => {
  if (!token) {
    throw new AuthenticationError('Refresh token is required');
  }

  // 1. Verify the refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token. Please log in again.');
  }

  // 2. Find user and verify the stored refresh token matches
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new AuthenticationError('User not found. Please log in again.');
  }

  if (user.refreshToken !== token) {
    // Token reuse detected – possible token theft. Invalidate all tokens.
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });

    throw new AuthenticationError('Refresh token has been revoked. Please log in again.');
  }

  // 3. Generate new token pair (token rotation for added security)
  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

  // 4. Store the new refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

// ── LOGOUT ──────────────────────────────────────────────────

/**
 * Log out a user by clearing their stored refresh token.
 *
 * @param {string} userId - The authenticated user's ID.
 * @returns {Promise<void>}
 */
export const logout = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};

// ── GET CURRENT USER ────────────────────────────────────────

/**
 * Get the authenticated user's profile.
 *
 * @param {string} userId - The authenticated user's ID.
 * @returns {Promise<object>} Sanitized user object.
 * @throws {NotFoundError} If user does not exist.
 */
export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return sanitizeUser(user);
};

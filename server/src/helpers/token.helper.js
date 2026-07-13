// ============================================================
// JWT Token Helper
// Generate and verify JWT access and refresh tokens.
// ============================================================

import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

/**
 * Generate a JWT access token.
 *
 * @param {object} payload - Token payload (userId, role).
 * @returns {string} Signed JWT access token.
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.accessToken.secret, {
    expiresIn: jwtConfig.accessToken.expiresIn,
  });
};

/**
 * Generate a JWT refresh token.
 *
 * @param {object} payload - Token payload (userId).
 * @returns {string} Signed JWT refresh token.
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refreshToken.secret, {
    expiresIn: jwtConfig.refreshToken.expiresIn,
  });
};

/**
 * Verify a JWT access token.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {object} Decoded token payload.
 * @throws {JsonWebTokenError|TokenExpiredError} If verification fails.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, jwtConfig.accessToken.secret);
};

/**
 * Verify a JWT refresh token.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {object} Decoded token payload.
 * @throws {JsonWebTokenError|TokenExpiredError} If verification fails.
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtConfig.refreshToken.secret);
};

/**
 * Generate both access and refresh tokens for a user.
 *
 * @param {object} user - User object with id and role.
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export const generateTokenPair = (user) => {
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  return { accessToken, refreshToken };
};

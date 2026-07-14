// ============================================================
// Auth Controller
// Thin HTTP layer for authentication endpoints.
// Responsibilities:
//  • Parse incoming request data (body, cookies, params)
//  • Delegate to auth.service for all business logic
//  • Set/clear HTTP-only cookies for refresh tokens
//  • Format and send responses via response helpers
//
// Rule: NO business logic here – keep controllers thin.
// ============================================================

import * as authService from './auth.service.js';
import { sendSuccess, sendCreated } from '../../helpers/response.helper.js';
import { cookieOptions } from '../../config/jwt.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── Cookie name constant ────────────────────────────────────
const REFRESH_TOKEN_COOKIE = 'refreshToken';

// ── REGISTER ────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Create a new user account and return tokens.
 */
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  const user = await authService.registerUser({ firstName, lastName, email, password, phone });

  return sendCreated(res, {
    message: 'User registered successfully',
    data: user,
  });
});

// ── LOGIN ───────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 * Authenticate an existing user and return tokens.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.loginUser({ email, password });

  // Set refresh token as HTTP-only cookie
  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, cookieOptions);

  return sendSuccess(res, {
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

// ── LOGOUT ──────────────────────────────────────────────────

/**
 * POST /api/v1/auth/logout
 * Revoke the refresh token and clear the cookie.
 * Requires authentication (protected route).
 */
export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user.userId);

  // Clear the refresh token cookie
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });

  return sendSuccess(res, {
    message: 'Logged out successfully',
  });
});

// ── REFRESH TOKEN ───────────────────────────────────────────

/**
 * POST /api/v1/auth/refresh-token
 * Issue a new access token using the refresh token cookie.
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE];

  const result = await authService.refreshAccessToken(token);

  // Set the rotated refresh token cookie
  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, cookieOptions);

  return sendSuccess(res, {
    message: 'Token refreshed successfully',
    data: {
      accessToken: result.accessToken,
    },
  });
});

// ── GET CURRENT USER ────────────────────────────────────────

/**
 * GET /api/v1/auth/me
 * Return the authenticated user's profile.
 * Requires authentication (protected route).
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  // Delegates to the user module's service for profile retrieval
  // For now, import is deferred to avoid circular dependencies.
  // The service will be wired in Phase 3 Part 3.
  const { getUserById } = await import('../users/user.service.js');
  const user = await getUserById(req.user.userId);

  return sendSuccess(res, {
    message: 'User profile retrieved successfully',
    data: { user },
  });
});

// ============================================================
// Authentication Controller
// Thin controller layer that delegates to auth.service.js.
// Handles HTTP concerns: request parsing, cookie management,
// and response formatting.
// ============================================================

import * as authService from '../services/auth.service.js';
import { sendSuccess, sendCreated } from '../helpers/response.helper.js';
import { cookieOptions } from '../config/jwt.js';
import asyncHandler from '../utils/asyncHandler.js';

// ── Cookie name constants ──────────────────────────────────
const REFRESH_TOKEN_COOKIE = 'refreshToken';

// ── REGISTER ────────────────────────────────────────────────

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  const result = await authService.register({ fullName, email, password, phone });

  // Set refresh token as HTTP-only cookie
  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, cookieOptions);

  return sendCreated(res, {
    message: 'Registration successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

// ── LOGIN ───────────────────────────────────────────────────

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

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

// ── REFRESH TOKEN ───────────────────────────────────────────

export const refreshToken = asyncHandler(async (req, res) => {
  // Read refresh token from cookie
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE];

  const result = await authService.refreshAccessToken(token);

  // Set the new rotated refresh token cookie
  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, cookieOptions);

  return sendSuccess(res, {
    message: 'Token refreshed successfully',
    data: {
      accessToken: result.accessToken,
    },
  });
});

// ── LOGOUT ──────────────────────────────────────────────────

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.userId);

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

// ── GET CURRENT USER ────────────────────────────────────────

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.userId);

  return sendSuccess(res, {
    message: 'User profile retrieved successfully',
    data: { user },
  });
});

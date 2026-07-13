// ============================================================
// JWT & Cookie Configuration
// Centralizes token secrets, expiry, and cookie options
// for both access and refresh tokens.
// ============================================================

import env from './env.js';

const jwtConfig = {
  accessToken: {
    secret: env.jwtAccessSecret,
    expiresIn: env.accessTokenExpire,
  },
  refreshToken: {
    secret: env.jwtRefreshSecret,
    expiresIn: env.refreshTokenExpire,
  },
};

/**
 * HTTP-only cookie options for the refresh token.
 * - httpOnly: prevents XSS access to the cookie
 * - secure: only sent over HTTPS in production
 * - sameSite: 'strict' in production, 'lax' in development
 * - maxAge: 7 days in milliseconds
 */
const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export { jwtConfig, cookieOptions };

// ============================================================
// Authentication Middleware
// Verifies JWT access token from Authorization header or
// cookies. Attaches decoded user payload to req.user.
// ============================================================

import { AuthenticationError } from '../errors/index.js';
import { verifyAccessToken } from '../helpers/token.helper.js';

/**
 * Authenticate the request by verifying the JWT access token.
 *
 * Token is extracted from:
 * 1. Authorization: Bearer <token> header
 * 2. req.cookies.accessToken (fallback)
 *
 * On success, sets req.user = { userId, role }.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = (req, _res, next) => {
  try {
    // 1. Extract token from Authorization header
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Fallback to cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // 3. No token found
    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    // 4. Verify and decode
    const decoded = verifyAccessToken(token);

    // 5. Attach user payload to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Invalid or expired access token'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid or expired access token'));
    }
    if (error instanceof AuthenticationError) {
      return next(error);
    }

    return next(new AuthenticationError('Invalid or expired access token'));
  }
};

export default authenticate;

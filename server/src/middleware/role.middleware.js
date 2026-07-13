// ============================================================
// Role Authorization Middleware
// Checks if the authenticated user has one of the allowed roles.
// Must be used AFTER authenticate middleware.
// ============================================================

import { AuthorizationError } from '../errors/index.js';

/**
 * Creates middleware that restricts access to specified roles.
 *
 * @param {...string} allowedRoles - Roles permitted to access the route.
 * @returns {import('express').RequestHandler} Express middleware.
 *
 * @example
 * router.get('/admin/dashboard', authenticate, authorize('ADMIN'), controller.dashboard);
 * router.get('/reports', authenticate, authorize('ADMIN', 'AGENT'), controller.reports);
 */
const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    // req.user is set by authenticate middleware
    if (!req.user) {
      throw new AuthorizationError('Authentication is required before authorization.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AuthorizationError(
        `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`
      );
    }

    next();
  };
};

export default authorize;

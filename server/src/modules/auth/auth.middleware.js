// ============================================================
// Auth Middleware
// Module-specific middleware for the auth module.
//
// Re-exports the global authenticate middleware so that the
// auth module can be self-contained. Additional auth-specific
// middleware (e.g., requireVerifiedEmail) can be added here
// as the application evolves.
//
// For role-based authorization, use the existing role
// middleware (src/middleware/role.middleware.js) separately.
// ============================================================

import authenticate from '../../middleware/auth.middleware.js';

// ── RE-EXPORT GLOBAL AUTH MIDDLEWARE ─────────────────────────

/**
 * JWT authentication middleware.
 * Extracts and verifies the access token from the Authorization
 * header or cookies and attaches req.user = { userId, role }.
 *
 * Usage inside auth.routes.js:
 *   router.post('/logout', requireAuth, authController.logout);
 */
export const requireAuth = authenticate;

// ── PLACEHOLDER: FUTURE MIDDLEWARE ──────────────────────────

/**
 * Middleware to require a verified email before proceeding.
 *
 * @todo Phase 4 – implement email verification check.
 */
export const requireVerifiedEmail = (req, _res, next) => {
  // TODO: Implement email verification check
  next();
};

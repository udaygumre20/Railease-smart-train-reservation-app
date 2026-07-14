// ============================================================
// Auth Module – Barrel Export
// Single entry-point for the auth module. Other parts of the
// application should import from here, not from individual files.
//
// Example:
//   import { authRoutes } from '../modules/auth/index.js';
//   router.use('/auth', authRoutes);
// ============================================================

export { default as authRoutes } from './auth.routes.js';
export * as authController from './auth.controller.js';
export * as authService from './auth.service.js';
export * as authRepository from './auth.repository.js';
export { registerSchema, loginSchema } from './auth.validation.js';
export { requireAuth, requireVerifiedEmail } from './auth.middleware.js';
export * as authUtils from './auth.utils.js';

// ============================================================
// Auth Routes
// Defines the Express router for all /api/v1/auth endpoints.
//
// Route table:
//  POST /register       → Create new account (public)
//  POST /login          → Authenticate user   (public)
//  POST /logout         → Revoke refresh token (protected)
//  POST /refresh-token  → Rotate tokens        (public)
//  GET  /me             → Current user profile  (protected)
//
// Validation middleware runs Zod schemas before controllers.
// Protected routes require a valid JWT access token.
// ============================================================

import { Router } from 'express';
import * as authController from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import validate from '../../middleware/validate.middleware.js';

const router = Router();

// ── Public Routes ───────────────────────────────────────────
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);

// ── Protected Routes ────────────────────────────────────────
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getCurrentUser);

export default router;

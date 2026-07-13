// ============================================================
// Authentication Routes
// POST /api/v1/auth/register
// POST /api/v1/auth/login
// POST /api/v1/auth/refresh-token
// POST /api/v1/auth/logout
// GET  /api/v1/auth/me
// ============================================================

import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import validate from '../middleware/validate.middleware.js';
import authenticate from '../middleware/auth.middleware.js';
import { registerSchema, loginSchema } from '../validation/auth.validation.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes (require authentication)
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;

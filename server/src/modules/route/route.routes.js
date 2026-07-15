// ============================================================
// Route Routes
// Defines the Express router for all /api/v1/routes endpoints.
//
// Route table:
//  POST   /              → Create a new route         (protected)
//  GET    /              → List all routes            (protected)
//  GET    /:id           → Get a single route by ID   (protected)
//  PUT    /:id           → Update a route             (protected)
//  DELETE /:id           → Soft-delete a route        (protected)
//
// All routes require JWT authentication.
// Validation middleware runs Zod schemas before controllers.
// ============================================================

import { Router } from 'express';
import * as routeController from './route.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import {
  createRouteSchema,
  updateRouteSchema,
  routeIdParamSchema,
  routeQuerySchema,
} from './route.validation.js';

const router = Router();

// ── All route routes require authentication ─────────────────
router.use(authenticate);

// ── Routes ──────────────────────────────────────────────────
router.post(
  '/',
  validate({ body: createRouteSchema }),
  routeController.createRoute,
);

router.get(
  '/',
  validate({ query: routeQuerySchema }),
  routeController.getAllRoutes,
);

router.get(
  '/:id',
  validate({ params: routeIdParamSchema }),
  routeController.getRouteById,
);

router.put(
  '/:id',
  validate({ params: routeIdParamSchema, body: updateRouteSchema }),
  routeController.updateRoute,
);

router.delete(
  '/:id',
  validate({ params: routeIdParamSchema }),
  routeController.deleteRoute,
);

export default router;

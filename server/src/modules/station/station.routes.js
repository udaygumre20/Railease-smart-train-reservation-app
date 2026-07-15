// ============================================================
// Station Routes
// Defines the Express router for all /api/v1/stations endpoints.
//
// Route table:
//  POST   /              → Create a new station       (protected)
//  GET    /              → List all stations           (protected)
//  GET    /:id           → Get a single station by ID  (protected)
//  PUT    /:id           → Update a station            (protected)
//  DELETE /:id           → Soft-delete a station       (protected)
//
// All routes require JWT authentication.
// Validation middleware runs Zod schemas before controllers.
// ============================================================

import { Router } from 'express';
import * as stationController from './station.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import {
  createStationSchema,
  updateStationSchema,
  stationIdParamSchema,
  stationQuerySchema,
} from './station.validation.js';

const router = Router();

// ── All station routes require authentication ───────────────
router.use(authenticate);

// ── Routes ──────────────────────────────────────────────────
router.post(
  '/',
  validate({ body: createStationSchema }),
  stationController.createStation,
);

router.get(
  '/',
  validate({ query: stationQuerySchema }),
  stationController.getAllStations,
);

router.get(
  '/:id',
  validate({ params: stationIdParamSchema }),
  stationController.getStationById,
);

router.put(
  '/:id',
  validate({ params: stationIdParamSchema, body: updateStationSchema }),
  stationController.updateStation,
);

router.delete(
  '/:id',
  validate({ params: stationIdParamSchema }),
  stationController.deleteStation,
);

export default router;

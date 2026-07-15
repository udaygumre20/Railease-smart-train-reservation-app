// ============================================================
// Train Routes
// Defines the Express router for all /api/v1/trains endpoints.
//
// Route table:
//  POST   /              → Create a new train        (protected)
//  GET    /              → List all trains            (protected)
//  GET    /:id           → Get a single train by ID   (protected)
//  PUT    /:id           → Update a train             (protected)
//  DELETE /:id           → Delete a train             (protected)
//
// All routes require JWT authentication.
// Validation middleware runs Zod schemas before controllers.
// ============================================================

import { Router } from 'express';
import * as trainController from './train.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import {
  createTrainSchema,
  updateTrainSchema,
  trainIdParamSchema,
  trainQuerySchema,
  searchTrainsQuerySchema,
} from './train.validation.js';

const router = Router();

// ── PUBLIC ROUTES ───────────────────────────────────────────
router.get(
  '/search',
  validate({ query: searchTrainsQuerySchema }),
  trainController.searchTrains,
);

// ── PROTECTED ROUTES ────────────────────────────────────────
router.use(authenticate);

// ── Routes ──────────────────────────────────────────────────
router.post(
  '/',
  validate({ body: createTrainSchema }),
  trainController.createTrain,
);

router.get(
  '/',
  validate({ query: trainQuerySchema }),
  trainController.getAllTrains,
);

router.get(
  '/:id',
  validate({ params: trainIdParamSchema }),
  trainController.getTrainById,
);

router.put(
  '/:id',
  validate({ params: trainIdParamSchema, body: updateTrainSchema }),
  trainController.updateTrain,
);

router.delete(
  '/:id',
  validate({ params: trainIdParamSchema }),
  trainController.deleteTrain,
);

export default router;

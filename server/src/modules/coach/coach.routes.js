// ============================================================
// Coach Routes
// Defines Express routers for coach-related endpoints.
//
// Route table:
//  GET    /trains/:trainId/coaches          → List coaches       (public)
//  GET    /coaches/:coachId                 → Coach details      (public)
//  GET    /coaches/:coachId/seat-map        → Seat map           (public)
//  GET    /coaches/:coachId/availability    → Seat availability  (public)
//  POST   /seats/recommend                  → Recommendations    (auth)
//  POST   /admin/coaches                    → Create coach       (admin)
//  PUT    /admin/coaches/:coachId           → Update coach       (admin)
//  GET    /admin/layout-templates           → List templates     (admin)
//  GET    /admin/layout-templates/:type     → Get template       (admin)
//  POST   /admin/layout-templates           → Create template    (admin)
// ============================================================

import { Router } from 'express';
import * as coachController from './coach.controller.js';
import authenticate from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/role.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import {
  coachIdParamSchema,
  trainIdParamSchema,
  seatMapQuerySchema,
  availabilityQuerySchema,
  createCoachSchema,
  updateCoachSchema,
  recommendationSchema,
  layoutTypeParamSchema,
  createLayoutTemplateSchema,
} from './coach.validation.js';

// ── Public Coach Router (mounted at /api/v1) ────────────────
const publicRouter = Router();

// List coaches for a train
publicRouter.get(
  '/trains/:trainId/coaches',
  validate({ params: trainIdParamSchema }),
  coachController.getCoachesByTrain,
);

// Coach details
publicRouter.get(
  '/coaches/:coachId',
  validate({ params: coachIdParamSchema }),
  coachController.getCoachDetails,
);

// Seat map
publicRouter.get(
  '/coaches/:coachId/seat-map',
  validate({ params: coachIdParamSchema, query: seatMapQuerySchema }),
  coachController.getSeatMap,
);

// Seat availability
publicRouter.get(
  '/coaches/:coachId/availability',
  validate({ params: coachIdParamSchema, query: availabilityQuerySchema }),
  coachController.getSeatAvailability,
);

// ── Authenticated Routes ────────────────────────────────────
const authRouter = Router();
authRouter.use(authenticate);

// Seat recommendation
authRouter.post(
  '/seats/recommend',
  validate({ body: recommendationSchema }),
  coachController.getRecommendations,
);

// ── Admin Routes ────────────────────────────────────────────
const adminRouter = Router();
adminRouter.use(authenticate);
adminRouter.use(authorize('ADMIN'));

// Create coach
adminRouter.post(
  '/coaches',
  validate({ body: createCoachSchema }),
  coachController.createCoach,
);

// Update coach
adminRouter.put(
  '/coaches/:coachId',
  validate({ params: coachIdParamSchema, body: updateCoachSchema }),
  coachController.updateCoach,
);

// Layout templates
adminRouter.get(
  '/layout-templates',
  coachController.getAllLayoutTemplates,
);

adminRouter.get(
  '/layout-templates/:layoutType',
  validate({ params: layoutTypeParamSchema }),
  coachController.getLayoutTemplateByType,
);

adminRouter.post(
  '/layout-templates',
  validate({ body: createLayoutTemplateSchema }),
  coachController.createLayoutTemplate,
);

export { publicRouter as coachPublicRoutes, authRouter as coachAuthRoutes, adminRouter as coachAdminRoutes };

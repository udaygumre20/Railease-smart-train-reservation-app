// ============================================================
// Train Module – Barrel Export
// Single entry-point for the train module. Other parts of the
// application should import from here, not from individual files.
//
// Example:
//   import { trainRoutes } from '../modules/train/index.js';
//   router.use('/trains', trainRoutes);
// ============================================================

export { default as trainRoutes } from './train.routes.js';
export * as trainController from './train.controller.js';
export * as trainService from './train.service.js';
export * as trainRepository from './train.repository.js';
export {
  createTrainSchema,
  updateTrainSchema,
  trainIdParamSchema,
  trainQuerySchema,
} from './train.validation.js';

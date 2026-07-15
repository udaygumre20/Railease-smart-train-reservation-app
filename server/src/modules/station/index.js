// ============================================================
// Station Module – Barrel Export
// Single entry-point for the station module. Other parts of the
// application should import from here, not from individual files.
//
// Example:
//   import { stationRoutes } from '../modules/station/index.js';
//   router.use('/stations', stationRoutes);
// ============================================================

export { default as stationRoutes } from './station.routes.js';
export * as stationController from './station.controller.js';
export * as stationService from './station.service.js';
export * as stationRepository from './station.repository.js';
export {
  createStationSchema,
  updateStationSchema,
  stationIdParamSchema,
  stationQuerySchema,
} from './station.validation.js';

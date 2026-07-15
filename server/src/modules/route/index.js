// ============================================================
// Route Module – Barrel Export
// Single entry-point for the route module. Other parts of the
// application should import from here, not from individual files.
//
// Example:
//   import { routeRoutes } from '../modules/route/index.js';
//   router.use('/routes', routeRoutes);
// ============================================================

export { default as routeRoutes } from './route.routes.js';
export * as routeController from './route.controller.js';
export * as routeService from './route.service.js';
export * as routeRepository from './route.repository.js';
export {
  createRouteSchema,
  updateRouteSchema,
  routeIdParamSchema,
  routeQuerySchema,
} from './route.validation.js';

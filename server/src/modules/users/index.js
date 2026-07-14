// ============================================================
// User Module – Barrel Export
// Single entry-point for the user module. Other parts of the
// application import from here, not from individual files.
//
// Example:
//   import { userService } from '../modules/users/index.js';
//   const user = await userService.getUserById(id);
// ============================================================

export * as userService from './user.service.js';
export * as userRepository from './user.repository.js';

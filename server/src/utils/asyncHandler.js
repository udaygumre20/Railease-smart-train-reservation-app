// ============================================================
// Async Handler Wrapper
// Higher-order function that catches rejected promises in
// Express route handlers and forwards them to next(err).
// Eliminates repetitive try/catch blocks in controllers.
// ============================================================

/**
 * Wraps an async Express route handler to catch errors.
 *
 * @param {Function} fn - Async route handler (req, res, next).
 * @returns {Function} Express middleware with error forwarding.
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await UserService.findAll();
 *   res.json(users);
 * }));
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;

// ============================================================
// Not Found Middleware
// Catch-all handler for unmatched routes. Returns a 404 JSON
// response instead of Express's default HTML error page.
// ============================================================

import ApiResponse from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/http.constants.js';

/**
 * Handle requests to undefined routes.
 */
const notFound = (req, res) => {
  return ApiResponse.error(res, {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export default notFound;

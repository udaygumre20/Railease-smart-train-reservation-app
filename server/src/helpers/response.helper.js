// ============================================================
// Response Helper
// Convenience wrappers around ApiResponse for common patterns.
// Used inside controllers to keep them thin.
// ============================================================

import ApiResponse from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/http.constants.js';

/**
 * Send a success response with data.
 */
export const sendSuccess = (res, { data = null, message = 'Success', statusCode = HTTP_STATUS.OK } = {}) => {
  return ApiResponse.success(res, { statusCode, message, data });
};

/**
 * Send a created (201) response with data.
 */
export const sendCreated = (res, { data = null, message = 'Resource created successfully' } = {}) => {
  return ApiResponse.success(res, { statusCode: HTTP_STATUS.CREATED, message, data });
};

/**
 * Send an error response.
 */
export const sendError = (res, { message = 'Error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = [] } = {}) => {
  return ApiResponse.error(res, { statusCode, message, errors });
};

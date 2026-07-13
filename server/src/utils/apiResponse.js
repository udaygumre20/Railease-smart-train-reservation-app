// ============================================================
// API Response Helper
// Standardized response format for all API endpoints.
// Ensures consistent JSON structure across success and error.
// ============================================================

import { HTTP_STATUS } from '../constants/http.constants.js';

class ApiResponse {
  /**
   * Send a success response.
   *
   * @param {import('express').Response} res
   * @param {object}  options
   * @param {number}  [options.statusCode=200]
   * @param {string}  [options.message='Success']
   * @param {*}       [options.data=null]
   */
  static success(res, { statusCode = HTTP_STATUS.OK, message = 'Success', data = null } = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send an error response.
   *
   * @param {import('express').Response} res
   * @param {object}  options
   * @param {number}  [options.statusCode=500]
   * @param {string}  [options.message='Internal server error']
   * @param {Array}   [options.errors=[]]
   */
  static error(res, { statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = 'Internal server error', errors = [] } = {}) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}

export default ApiResponse;

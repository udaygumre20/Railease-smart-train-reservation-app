// ============================================================
// AppError – Base Application Error
// All custom errors extend this class. Includes statusCode,
// operational flag (trusted vs programming errors), and
// optional structured errors array.
// ============================================================

import { HTTP_STATUS } from '../constants/http.constants.js';

class AppError extends Error {
  /**
   * @param {string}  message     - Human-readable error message.
   * @param {number}  statusCode  - HTTP status code.
   * @param {Array}   [errors=[]] - Structured error details (e.g., field-level validation).
   * @param {boolean} [isOperational=true] - Whether this is an expected (operational) error.
   */
  constructor(
    message = 'Something went wrong',
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors = [],
    isOperational = true
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    // Capture stack trace, excluding the constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;

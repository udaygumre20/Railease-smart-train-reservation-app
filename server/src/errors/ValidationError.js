// ============================================================
// ValidationError – 422 Unprocessable Entity
// Thrown when request data fails Zod schema validation.
// Carries a structured errors array with field-level details.
// ============================================================

import AppError from './AppError.js';
import { HTTP_STATUS, HTTP_MESSAGE } from '../constants/http.constants.js';

class ValidationError extends AppError {
  /**
   * @param {string} [message] - Custom error message.
   * @param {Array}  [errors]  - Array of field-level validation errors.
   */
  constructor(message = HTTP_MESSAGE.UNPROCESSABLE_ENTITY, errors = []) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
  }
}

export default ValidationError;

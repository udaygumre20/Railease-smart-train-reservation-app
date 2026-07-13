// ============================================================
// ConflictError – 409 Conflict
// Thrown when a resource already exists (e.g., duplicate email).
// ============================================================

import AppError from './AppError.js';
import { HTTP_STATUS, HTTP_MESSAGE } from '../constants/http.constants.js';

class ConflictError extends AppError {
  /**
   * @param {string} [message] - Custom error message.
   */
  constructor(message = HTTP_MESSAGE.CONFLICT) {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

export default ConflictError;

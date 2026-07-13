// ============================================================
// NotFoundError – 404 Not Found
// Thrown when a requested resource does not exist.
// ============================================================

import AppError from './AppError.js';
import { HTTP_STATUS, HTTP_MESSAGE } from '../constants/http.constants.js';

class NotFoundError extends AppError {
  /**
   * @param {string} [message] - Custom error message.
   */
  constructor(message = HTTP_MESSAGE.NOT_FOUND) {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

export default NotFoundError;

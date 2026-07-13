// ============================================================
// AuthorizationError – 403 Forbidden
// Thrown when an authenticated user lacks required permissions.
// ============================================================

import AppError from './AppError.js';
import { HTTP_STATUS, HTTP_MESSAGE } from '../constants/http.constants.js';

class AuthorizationError extends AppError {
  /**
   * @param {string} [message] - Custom error message.
   */
  constructor(message = HTTP_MESSAGE.FORBIDDEN) {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

export default AuthorizationError;

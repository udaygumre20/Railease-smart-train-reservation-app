// ============================================================
// AuthenticationError – 401 Unauthorized
// Thrown when a request lacks valid authentication credentials.
// ============================================================

import AppError from './AppError.js';
import { HTTP_STATUS, HTTP_MESSAGE } from '../constants/http.constants.js';

class AuthenticationError extends AppError {
  /**
   * @param {string} [message] - Custom error message.
   */
  constructor(message = HTTP_MESSAGE.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export default AuthenticationError;

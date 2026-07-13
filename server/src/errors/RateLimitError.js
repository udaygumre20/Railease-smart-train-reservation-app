// ============================================================
// RateLimitError – 429 Too Many Requests
// Thrown when a client exceeds the rate limit.
// ============================================================

import AppError from './AppError.js';
import { HTTP_STATUS, HTTP_MESSAGE } from '../constants/http.constants.js';

class RateLimitError extends AppError {
  /**
   * @param {string} [message] - Custom error message.
   */
  constructor(message = HTTP_MESSAGE.TOO_MANY_REQUESTS) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS);
  }
}

export default RateLimitError;

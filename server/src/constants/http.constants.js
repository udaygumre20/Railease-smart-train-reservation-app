// ============================================================
// HTTP Status Codes & Messages
// Centralized constants to avoid magic numbers throughout
// the codebase.
// ============================================================

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});

export const HTTP_MESSAGE = Object.freeze({
  OK: 'Success',
  CREATED: 'Resource created successfully',
  BAD_REQUEST: 'Bad request',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exists',
  UNPROCESSABLE_ENTITY: 'Validation failed',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  INTERNAL_SERVER_ERROR: 'Internal server error',
});

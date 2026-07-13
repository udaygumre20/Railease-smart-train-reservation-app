// ============================================================
// Global Error Handler Middleware
// Catches all errors and returns a standardized JSON response.
// Handles AppError subclasses, Prisma errors, JWT errors,
// Zod errors, and unexpected programming errors.
// ============================================================

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../errors/index.js';
import ApiResponse from '../utils/apiResponse.js';
import logger from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/http.constants.js';
import { env } from '../config/index.js';

/**
 * Global error handling middleware.
 * Must be registered LAST in the middleware chain.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`);
  if (env.isDevelopment) {
    logger.debug('Stack trace:', err.stack);
  }

  // ── 1. Custom AppError (operational errors) ────────────
  if (err instanceof AppError) {
    return ApiResponse.error(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  // ── 2. Zod Validation Errors ──────────────────────────
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  // ── 3. Prisma Known Request Errors ────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err, res);
  }

  // ── 4. Prisma Validation Errors ───────────────────────
  if (err instanceof Prisma.PrismaClientValidationError) {
    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: 'Invalid data provided to database query',
    });
  }

  // ── 5. JWT Errors ─────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: 'Invalid token. Please log in again.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: 'Token has expired. Please refresh your token.',
    });
  }

  // ── 6. Syntax Error (malformed JSON body) ─────────────
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return ApiResponse.error(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: 'Invalid JSON in request body',
    });
  }

  // ── 7. Unknown / Programming Errors ───────────────────
  return ApiResponse.error(res, {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: env.isProduction
      ? 'An unexpected error occurred'
      : err.message || 'Internal server error',
  });
};

/**
 * Handle Prisma-specific error codes.
 */
const handlePrismaError = (err, res) => {
  switch (err.code) {
    // Unique constraint violation
    case 'P2002': {
      const fields = err.meta?.target;
      const fieldName = Array.isArray(fields) ? fields.join(', ') : 'field';
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.CONFLICT,
        message: `A record with this ${fieldName} already exists`,
        errors: [{ field: fieldName, message: 'Must be unique' }],
      });
    }

    // Record not found
    case 'P2025':
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: err.meta?.cause || 'Record not found',
      });

    // Foreign key constraint failed
    case 'P2003': {
      const fkField = err.meta?.field_name || 'related record';
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: `Referenced ${fkField} does not exist`,
      });
    }

    default:
      return ApiResponse.error(res, {
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'A database error occurred',
      });
  }
};

export default errorHandler;

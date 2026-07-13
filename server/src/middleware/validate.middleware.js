// ============================================================
// Validation Middleware
// Generic middleware factory that validates req.body against
// a Zod schema. Throws ValidationError on failure.
// ============================================================

import { ZodError } from 'zod';
import { ValidationError } from '../errors/index.js';

/**
 * Creates middleware that validates the request body against
 * the provided Zod schema.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against.
 * @returns {import('express').RequestHandler} Express middleware.
 *
 * @example
 * router.post('/register', validate(registerSchema), controller.register);
 */
const validate = (schema) => {
  return (req, _res, next) => {
    try {
      // Parse and replace req.body with the validated/transformed data
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new ValidationError('Validation failed', formattedErrors);
      }

      next(error);
    }
  };
};

export default validate;

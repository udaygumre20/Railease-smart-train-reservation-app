// ============================================================
// Validation Middleware
// Generic middleware factory that validates req.body, req.params,
// and/or req.query against Zod schemas. Throws ValidationError
// on failure.
//
// Supports two calling conventions:
//  1. validate(zodSchema)          → validates req.body only
//  2. validate({ body, params, query }) → validates each target
// ============================================================

import { ZodError } from 'zod';
import { ValidationError } from '../errors/index.js';

/**
 * Creates middleware that validates request data against
 * the provided Zod schema(s).
 *
 * @param {import('zod').ZodSchema | { body?: import('zod').ZodSchema, params?: import('zod').ZodSchema, query?: import('zod').ZodSchema }} schema
 * @returns {import('express').RequestHandler} Express middleware.
 *
 * @example
 * // Body-only (backward-compatible)
 * router.post('/register', validate(registerSchema), controller.register);
 *
 * // Multi-target
 * router.get('/:id', validate({ params: idParamSchema }), controller.getById);
 */
const validate = (schema) => {
  return (req, _res, next) => {
    try {
      // Determine if schema is a plain object with target keys or a single Zod schema
      const isMultiTarget =
        schema !== null &&
        typeof schema === 'object' &&
        !('parse' in schema) &&
        ('body' in schema || 'params' in schema || 'query' in schema);

      if (isMultiTarget) {
        // Validate each target independently
        if (schema.params) {
          req.params = schema.params.parse(req.params);
        }
        if (schema.query) {
          req.query = schema.query.parse(req.query);
        }
        if (schema.body) {
          req.body = schema.body.parse(req.body);
        }
      } else {
        // Legacy mode: validate req.body only
        req.body = schema.parse(req.body);
      }

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

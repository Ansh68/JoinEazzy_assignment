import { ApiError } from '../utils/ApiError.js';

// Usage: validate(schema) or validate(schema, 'query' | 'params').
// Replaces the request data with the parsed (cleaned) result.
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const errors = result.error.issues.map(({ path, message }) => ({
      field: path.join('.'),
      message,
    }));
    return next(ApiError.badRequest('Validation failed', errors));
  }

  req[source] = result.data;
  next();
};

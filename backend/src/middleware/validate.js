const ApiError = require('../utils/ApiError');

// validate(schema, 'body' | 'query' | 'params') — replaces the source with parsed data.
module.exports = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return next(ApiError.badRequest('Validation failed', errors));
  }
  req[source] = result.data;
  next();
};

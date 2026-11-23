import { env } from '../config/env.js';

const POSTGRES_ERROR_STATUS = {
  '23505': 409, // unique violation
  '23503': 400, // foreign key violation
};

// Express recognises error middleware by its 4 arguments.
export const errorHandler = (err, _req, res, _next) => {
  const status = err.status ?? POSTGRES_ERROR_STATUS[err.code] ?? 500;

  if (status >= 500) console.error(err);

  // Raw Postgres messages leak table/constraint names, so show a friendly one instead.
  const message =
    err.code === '23505' ? 'This record already exists'
    : status >= 500 && env.isProd ? 'Internal server error'
    : err.message;

  res.status(status).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  });
};

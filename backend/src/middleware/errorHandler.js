import { env } from '../config/env.js';

// Raw Postgres messages leak table and constraint names, so each known code gets a friendly one.
const POSTGRES_ERRORS = {
  '23505': { status: 409, message: 'This record already exists' },
  '23503': { status: 400, message: 'A related record does not exist' },
  '23502': { status: 400, message: 'A required value is missing' },
  '22P02': { status: 400, message: 'A value has an invalid format' },
};

// Errors thrown by express.json() before a request reaches any route.
const BODY_PARSER_ERRORS = {
  'entity.parse.failed': { status: 400, message: 'Request body is not valid JSON' },
  'entity.too.large': { status: 413, message: 'Request body is too large' },
};

const describeError = (err) => {
  const known = BODY_PARSER_ERRORS[err.type] ?? POSTGRES_ERRORS[err.code];
  if (known) return known;

  const status = err.status ?? 500;
  const hideDetails = status >= 500 && env.isProd;
  return { status, message: hideDetails ? 'Internal server error' : err.message };
};

// Express recognises error middleware by its 4 arguments.
export const errorHandler = (err, _req, res, _next) => {
  const { status, message } = describeError(err);

  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  });
};

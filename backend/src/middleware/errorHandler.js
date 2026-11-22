const { isProd } = require('../config/env');

// eslint-disable-next-line no-unused-vars
module.exports = (err, _req, res, _next) => {
  // Postgres unique violation / foreign key violation fallbacks
  if (err.code === '23505') err.status = 409;
  if (err.code === '23503') err.status = 400;

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    message: status >= 500 && isProd ? 'Internal server error' : err.message,
    ...(err.errors && { errors: err.errors }),
  });
};

import rateLimit from 'express-rate-limit';

const createLimiter = ({ limit, message }) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

// Slows down brute-force attempts on login and register.
export const authLimiter = createLimiter({
  limit: 50,
  message: 'Too many login attempts, please try again in a few minutes',
});

// Generous cap for the rest of the API.
export const apiLimiter = createLimiter({
  limit: 500,
  message: 'Too many requests, please slow down',
});

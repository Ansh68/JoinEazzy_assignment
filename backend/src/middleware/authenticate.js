import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';

// Reads the "Authorization: Bearer <token>" header and sets req.user = { id, role }.
export const authenticate = (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Authentication token is missing'));
  }

  try {
    const { id, role } = verifyToken(token);
    req.user = { id, role };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

import { ApiError } from '../utils/ApiError.js';

// Usage: authorize('admin') or authorize('student', 'admin'). Run after authenticate.
export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  next();
};

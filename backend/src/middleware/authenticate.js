import * as User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';

// Reads the "Authorization: Bearer <token>" header and sets req.user = { id, role }.
// The user is looked up on every request, so a deleted account or a changed role
// takes effect immediately instead of when the token expires.
export const authenticate = async (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Authentication token is missing'));
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }

  try {
    const user = await User.findById(payload.id);
    if (!user) return next(ApiError.unauthorized('This account no longer exists'));

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};

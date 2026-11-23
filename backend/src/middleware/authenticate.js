import * as User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';
import { createTtlCache } from '../utils/ttlCache.js';

// Looking the user up on every request costs a database round trip, so the result is kept for a
// few seconds. A deleted account or changed role takes effect within this window, not instantly.
const USER_CACHE_TTL_MS = 15_000;
const userCache = createTtlCache(USER_CACHE_TTL_MS);

const findUser = async (id) => {
  const cached = userCache.get(id);
  if (cached) return cached;

  const user = await User.findById(id);
  if (user) userCache.set(id, user);
  return user;
};

// Reads the "Authorization: Bearer <token>" header and sets req.user = { id, role }.
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
    const user = await findUser(payload.id);
    if (!user) return next(ApiError.unauthorized('This account no longer exists'));

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};

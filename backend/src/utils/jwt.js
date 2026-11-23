import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = ({ id, role }) =>
  jwt.sign({ id, role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

// Throws if the token is invalid or expired.
export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

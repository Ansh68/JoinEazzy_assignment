import bcrypt from 'bcrypt';
import * as User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/jwt.js';

const SALT_ROUNDS = 10;

export const register = asyncHandler(async (req, res) => {
  const { name, email, studentId, password } = req.body;

  const existing = await User.findByEmailOrStudentId({ email, studentId });
  if (existing) {
    const field = existing.email === email ? 'Email' : 'Student ID';
    throw ApiError.conflict(`${field} is already registered`);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.createStudent({ name, email, studentId, passwordHash });

  res.status(201).json({ success: true, token: signToken(user), user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const found = await User.findByEmailWithPassword(email);
  const isValid = found && (await bcrypt.compare(password, found.passwordHash));
  if (!isValid) throw ApiError.unauthorized('Invalid email or password');

  const { passwordHash, ...user } = found;
  res.json({ success: true, token: signToken(user), user });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  res.json({ success: true, user });
});

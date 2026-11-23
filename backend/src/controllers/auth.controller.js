import bcrypt from 'bcrypt';
import * as User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { throwConflictOnDuplicate } from '../utils/duplicate.js';
import { signToken } from '../utils/jwt.js';

const SALT_ROUNDS = 10;

// Compared against when the email is unknown, so a login for a missing account takes
// as long as one with a wrong password and can't be used to discover registered emails.
const DUMMY_HASH = bcrypt.hashSync('timing-protection', SALT_ROUNDS);

export const register = asyncHandler(async (req, res) => {
  const { name, email, studentId, password } = req.body;

  const [emailOwner, studentIdOwner] = await Promise.all([
    User.findByEmail(email),
    User.findByStudentId(studentId),
  ]);
  if (emailOwner) throw ApiError.conflict('Email is already registered');
  if (studentIdOwner) throw ApiError.conflict('Student ID is already registered');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await User.createStudent({ name, email, studentId, passwordHash });
    res.status(201).json({ success: true, token: signToken(user), user });
  } catch (error) {
    throwConflictOnDuplicate(error, 'Email or student ID is already registered');
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const found = await User.findByEmailWithPassword(email);
  const passwordMatches = await bcrypt.compare(password, found?.passwordHash ?? DUMMY_HASH);
  if (!found || !passwordMatches) throw ApiError.unauthorized('Invalid email or password');

  const { passwordHash, ...user } = found;
  res.json({ success: true, token: signToken(user), user });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.unauthorized('This account no longer exists');

  res.json({ success: true, user });
});

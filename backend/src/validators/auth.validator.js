import { z } from 'zod';

const email = z.string().trim().toLowerCase().max(254, 'Email is too long').pipe(z.email('Enter a valid email'));

// Stored in capitals so "stu001" and "STU001" are the same student.
export const studentId = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9_-]{3,20}$/, 'Student ID must be 3-20 letters, numbers, "-" or "_"');

// bcrypt only uses the first 72 bytes of a password, so longer ones are rejected.
const newPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name is too long')
    .transform((name) => name.replace(/\s+/g, ' ')),
  email,
  studentId,
  password: newPassword,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(72, 'Password is too long'),
});

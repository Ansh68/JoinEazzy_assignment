import { z } from 'zod';

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email'));

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email,
  studentId: z.string().trim().min(3, 'Student ID must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

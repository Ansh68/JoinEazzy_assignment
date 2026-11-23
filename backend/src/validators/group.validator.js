import { z } from 'zod';

const STUDENT_ID_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Group name must be at least 3 characters')
    .max(40, 'Group name is too long')
    .regex(/^[\p{L}\p{N} _.&'-]+$/u, 'Group name can only use letters, numbers, spaces and . _ - & \'')
    .transform((name) => name.replace(/\s+/g, ' ')),
});

// Either the student's email or their student ID, normalised the same way as registration.
export const addMemberSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, 'Enter the student email or student ID')
    .max(254, 'Value is too long')
    .refine(
      (value) => (value.includes('@') ? z.email().safeParse(value).success : STUDENT_ID_PATTERN.test(value)),
      'Enter a valid email or student ID',
    )
    .transform((value) => (value.includes('@') ? value.toLowerCase() : value.toUpperCase())),
});

export const groupParamsSchema = z.object({
  id: z.uuid('Invalid group id'),
});

export const memberParamsSchema = z.object({
  id: z.uuid('Invalid group id'),
  userId: z.uuid('Invalid user id'),
});

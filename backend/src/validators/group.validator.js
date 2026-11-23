import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().trim().min(3, 'Group name must be at least 3 characters').max(40, 'Group name is too long'),
});

// Either the student's email or their student ID.
export const addMemberSchema = z.object({
  identifier: z.string().trim().min(3, 'Enter the student email or student ID'),
});

export const groupParamsSchema = z.object({
  id: z.uuid('Invalid group id'),
});

export const memberParamsSchema = z.object({
  id: z.uuid('Invalid group id'),
  userId: z.uuid('Invalid user id'),
});

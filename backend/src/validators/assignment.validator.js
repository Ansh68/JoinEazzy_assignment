import { z } from 'zod';

const assignmentFields = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120, 'Title is too long'),
    description: z.string().trim().max(2000, 'Description is too long').default(''),
    dueDate: z.iso.datetime({ offset: true, error: 'Enter a valid due date' }),
    onedriveLink: z.httpUrl('Enter a valid OneDrive link (https://...)'),
    targetType: z.enum(['all', 'groups']).default('all'),
    groupIds: z.array(z.uuid()).default([]),
  })
  .refine((data) => data.targetType === 'all' || data.groupIds.length > 0, {
    path: ['groupIds'],
    message: 'Select at least one group',
  })
  // Targets only matter for "groups"; drop duplicates and ignore any ids sent with "all".
  .transform((data) => ({
    ...data,
    groupIds: data.targetType === 'groups' ? [...new Set(data.groupIds)] : [],
  }));

// New assignments can't be due in the past; edits may keep an old due date.
export const createAssignmentSchema = assignmentFields.refine(
  (data) => new Date(data.dueDate) > new Date(),
  { path: ['dueDate'], message: 'Due date must be in the future' },
);

export const updateAssignmentSchema = assignmentFields;

export const assignmentParamsSchema = z.object({
  id: z.uuid('Invalid assignment id'),
});

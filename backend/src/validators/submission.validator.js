import { z } from 'zod';

// Step two of the two-step confirmation: the client must explicitly send confirm: true.
export const confirmSubmissionSchema = z.object({
  confirm: z.literal(true, { error: 'You must confirm the submission' }),
});

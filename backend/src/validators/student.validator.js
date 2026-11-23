import { z } from 'zod';

// Characters with special meaning in PostgREST filters are stripped so the
// search text can't break out of the filter string.
const sanitiseSearch = (text) => text.replace(/[,()%*\\]/g, '');

export const searchStudentsSchema = z.object({
  q: z.string().trim().max(50).transform(sanitiseSearch).optional().default(''),
});

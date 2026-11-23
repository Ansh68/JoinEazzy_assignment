import { z } from 'zod';

// Characters with special meaning in PostgREST filters or LIKE patterns are stripped,
// so the search text can't break out of the filter string or act as a wildcard.
const sanitiseSearch = (text) => text.replace(/[,()%*_\\]/g, '');

export const searchStudentsSchema = z.object({
  q: z.string().trim().max(50, 'Search is too long').transform(sanitiseSearch).optional().default(''),
});

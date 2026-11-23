import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Server-side client using the service role key. It bypasses Row Level Security,
// so it must never be exposed to the browser.
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

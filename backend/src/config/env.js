import 'dotenv/config';

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const isProd = process.env.NODE_ENV === 'production';

if (isProd && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long in production');
}

// Without it the deployed frontend would be blocked by CORS with no obvious error, so fail early.
if (isProd && !process.env.CLIENT_URL) {
  throw new Error('CLIENT_URL must be set in production (the deployed frontend URL)');
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  // Comma-separated list, e.g. "https://app.vercel.app,http://localhost:5173".
  // Trailing slashes are removed because browsers send origins without one, so
  // "https://app.vercel.app/" would never match and CORS would block every request.
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  groupMaxSize: Number(process.env.GROUP_MAX_SIZE) || 10,
  isProd,
};

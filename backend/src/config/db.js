import pg from 'pg';
import { env } from './env.js';

// Supabase requires SSL, and its certificate chain isn't in Node's default store.
export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

pool.on('error', (err) => console.error('Unexpected PG pool error:', err.message));

export const query = (text, params) => pool.query(text, params);

// Runs `callback(client)` inside a transaction and rolls back if it throws.
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

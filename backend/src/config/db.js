const { Pool } = require('pg');
const { databaseUrl } = require('./env');

// Supabase requires SSL; its certificate chain is not in Node's default store.
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

pool.on('error', (err) => console.error('Unexpected PG pool error:', err.message));

const query = (text, params) => pool.query(text, params);

// Runs fn(client) inside a transaction; rolls back on any error.
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };

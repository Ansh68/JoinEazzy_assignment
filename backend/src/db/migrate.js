// Applies every .sql file in ./migrations (alphabetical order) that hasn't run yet.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, withTransaction } from '../config/db.js';

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

const migrate = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await pool.query('SELECT name FROM schema_migrations');
  const applied = new Set(rows.map(({ name }) => name));

  const pending = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql') && !applied.has(file))
    .sort();

  for (const file of pending) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8');

    await withTransaction(async (client) => {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
    });

    console.log(`Applied ${file}`);
  }

  console.log('Migrations up to date');
};

try {
  await migrate();
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

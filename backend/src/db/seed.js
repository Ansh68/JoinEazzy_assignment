// Creates the admin (professor) account and a few demo students. Safe to re-run.
import bcrypt from 'bcrypt';
import { pool, query } from '../config/db.js';

const ADMIN = {
  name: 'Prof. Admin',
  email: 'admin@joineazy.com',
  password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123',
};

const STUDENT_PASSWORD = process.env.SEED_STUDENT_PASSWORD ?? 'Student@123';

const STUDENTS = [
  ['Aarav Sharma', 'aarav@student.com', 'STU001'],
  ['Diya Patel', 'diya@student.com', 'STU002'],
  ['Rohan Mehta', 'rohan@student.com', 'STU003'],
  ['Ananya Iyer', 'ananya@student.com', 'STU004'],
  ['Kabir Singh', 'kabir@student.com', 'STU005'],
  ['Meera Nair', 'meera@student.com', 'STU006'],
];

const insertUser = async ({ name, email, studentId = null, password, role }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO users (name, email, student_id, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO NOTHING`,
    [name, email, studentId, passwordHash, role],
  );
};

const seed = async () => {
  await insertUser({ ...ADMIN, role: 'admin' });

  for (const [name, email, studentId] of STUDENTS) {
    await insertUser({ name, email, studentId, password: STUDENT_PASSWORD, role: 'student' });
  }

  console.log(`Seeded 1 admin (${ADMIN.email}) and ${STUDENTS.length} students.`);
};

try {
  await seed();
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

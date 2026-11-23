// Creates the admin (professor) account and a few demo students. Safe to re-run.
// Usage (from backend/): npm run seed
import bcrypt from 'bcrypt';
import { supabase } from '../src/config/supabase.js';
import { unwrap } from '../src/utils/unwrap.js';

const SALT_ROUNDS = 10;

const ADMIN = {
  name: 'Prof. Admin',
  email: 'admin@joineazy.com',
  password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123',
};

const STUDENT_PASSWORD = process.env.SEED_STUDENT_PASSWORD ?? 'Student@123';

const STUDENTS = [
  { name: 'Aarav Sharma', email: 'aarav@student.com', studentId: 'STU001' },
  { name: 'Diya Patel', email: 'diya@student.com', studentId: 'STU002' },
  { name: 'Rohan Mehta', email: 'rohan@student.com', studentId: 'STU003' },
  { name: 'Ananya Iyer', email: 'ananya@student.com', studentId: 'STU004' },
  { name: 'Kabir Singh', email: 'kabir@student.com', studentId: 'STU005' },
  { name: 'Meera Nair', email: 'meera@student.com', studentId: 'STU006' },
];

const buildUser = async ({ name, email, studentId = null, password, role }) => ({
  name,
  email,
  student_id: studentId,
  password_hash: await bcrypt.hash(password, SALT_ROUNDS),
  role,
});

const seed = async () => {
  const users = await Promise.all([
    buildUser({ ...ADMIN, role: 'admin' }),
    ...STUDENTS.map((student) => buildUser({ ...student, password: STUDENT_PASSWORD, role: 'student' })),
  ]);

  // Existing users (matched by email) are left untouched.
  unwrap(await supabase.from('users').upsert(users, { onConflict: 'email', ignoreDuplicates: true }));

  console.log(`Seeded 1 admin (${ADMIN.email}) and ${STUDENTS.length} students.`);
};

try {
  await seed();
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
}

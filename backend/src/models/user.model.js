import { query } from '../config/db.js';

const PUBLIC_COLUMNS = 'id, name, email, student_id AS "studentId", role, created_at AS "createdAt"';

export const findById = async (id) => {
  const { rows } = await query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0];
};

// Includes the password hash, so only use it for login.
export const findByEmailWithPassword = async (email) => {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS}, password_hash AS "passwordHash" FROM users WHERE email = $1`,
    [email],
  );
  return rows[0];
};

export const findByEmailOrStudentId = async ({ email, studentId }) => {
  const { rows } = await query(
    'SELECT email, student_id AS "studentId" FROM users WHERE email = $1 OR student_id = $2',
    [email, studentId],
  );
  return rows[0];
};

export const createStudent = async ({ name, email, studentId, passwordHash }) => {
  const { rows } = await query(
    `INSERT INTO users (name, email, student_id, password_hash, role)
     VALUES ($1, $2, $3, $4, 'student')
     RETURNING ${PUBLIC_COLUMNS}`,
    [name, email, studentId, passwordHash],
  );
  return rows[0];
};

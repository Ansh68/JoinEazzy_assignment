import { supabase } from '../config/supabase.js';
import { unwrap } from '../utils/unwrap.js';

// "alias:column" renames snake_case columns to camelCase in the response.
const PUBLIC_COLUMNS = 'id, name, email, studentId:student_id, role, createdAt:created_at';

export const findById = async (id) =>
  unwrap(await supabase.from('users').select(PUBLIC_COLUMNS).eq('id', id).maybeSingle());

export const findByEmail = async (email) =>
  unwrap(await supabase.from('users').select('id').eq('email', email).maybeSingle());

export const findByStudentId = async (studentId) =>
  unwrap(await supabase.from('users').select('id').eq('student_id', studentId).maybeSingle());

// Includes the password hash, so only use it for login.
export const findByEmailWithPassword = async (email) =>
  unwrap(
    await supabase
      .from('users')
      .select(`${PUBLIC_COLUMNS}, passwordHash:password_hash`)
      .eq('email', email)
      .maybeSingle(),
  );

export const createStudent = async ({ name, email, studentId, passwordHash }) =>
  unwrap(
    await supabase
      .from('users')
      .insert({ name, email, student_id: studentId, password_hash: passwordHash, role: 'student' })
      .select(PUBLIC_COLUMNS)
      .single(),
  );

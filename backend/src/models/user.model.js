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

export const findAllStudents = async () =>
  unwrap(await supabase.from('users').select(PUBLIC_COLUMNS).eq('role', 'student').order('name'));

// Finds a student by email or student ID (admins are never returned).
export const findStudentByIdentifier = async (identifier) => {
  const column = identifier.includes('@') ? 'email' : 'student_id';
  const value = column === 'email' ? identifier.toLowerCase() : identifier;

  return unwrap(
    await supabase
      .from('users')
      .select(PUBLIC_COLUMNS)
      .eq('role', 'student')
      .eq(column, value)
      .maybeSingle(),
  );
};

// Students who are not in any group yet, optionally filtered by name, email or student ID.
// `search` must already be sanitised (see student.validator.js) because it goes into a filter string.
export const searchStudentsWithoutGroup = async (search) => {
  const memberships = unwrap(await supabase.from('group_members').select('user_id'));
  const takenIds = memberships.map(({ user_id }) => user_id);

  let request = supabase.from('users').select(PUBLIC_COLUMNS).eq('role', 'student');
  if (takenIds.length > 0) request = request.not('id', 'in', `(${takenIds.join(',')})`);
  if (search) {
    request = request.or(`name.ilike.%${search}%,email.ilike.%${search}%,student_id.ilike.%${search}%`);
  }

  return unwrap(await request.order('name').limit(20));
};

export const createStudent =async ({ name, email, studentId, passwordHash }) =>
  unwrap(
    await supabase
      .from('users')
      .insert({ name, email, student_id: studentId, password_hash: passwordHash, role: 'student' })
      .select(PUBLIC_COLUMNS)
      .single(),
  );

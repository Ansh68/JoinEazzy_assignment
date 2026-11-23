import { api } from './client';

// Students who are not in a group yet, matching a name, email or student ID.
export const searchStudents = async (query) =>
  (await api.get('/students/search', { params: { q: query } })).data.students;

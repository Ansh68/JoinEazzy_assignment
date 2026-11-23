import { api } from './client';

export const getAssignments = async () => (await api.get('/assignments')).data.assignments;

// Confirms the submission for the student's whole group.
export const confirmSubmission = async (assignmentId) =>
  (await api.post(`/assignments/${assignmentId}/confirm`, { confirm: true })).data;

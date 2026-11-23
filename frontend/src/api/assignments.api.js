import { api } from './client';

export const getAssignments = async () => (await api.get('/assignments')).data.assignments;

export const getAssignment = async (id) => (await api.get(`/assignments/${id}`)).data.assignment;

// Admin: create, edit and delete assignments.
export const createAssignment = async (payload) => (await api.post('/assignments', payload)).data.assignment;

export const updateAssignment = async (id, payload) => (await api.put(`/assignments/${id}`, payload)).data.assignment;

export const deleteAssignment = async (id) => (await api.delete(`/assignments/${id}`)).data;

// Admin: group-wise and student-wise submission status for one assignment.
export const getAssignmentSubmissions = async (id) => (await api.get(`/assignments/${id}/submissions`)).data;

// Student: confirms the submission for their whole group.
export const confirmSubmission = async (assignmentId) =>
  (await api.post(`/assignments/${assignmentId}/confirm`, { confirm: true })).data;

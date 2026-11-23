import { api } from './client';

// Admin: every group with its members.
export const getAllGroups = async () => (await api.get('/groups')).data.groups;

// Returns the student's group with its members, or null if they have none.
export const getMyGroup = async () => (await api.get('/groups/me')).data.group;

export const createGroup = async (name) => (await api.post('/groups', { name })).data.group;

export const addMember = async (groupId, identifier) =>
  (await api.post(`/groups/${groupId}/members`, { identifier })).data.group;

export const removeMember = async (groupId, userId) =>
  (await api.delete(`/groups/${groupId}/members/${userId}`)).data.group;

export const leaveGroup = async (groupId) => (await api.post(`/groups/${groupId}/leave`)).data;

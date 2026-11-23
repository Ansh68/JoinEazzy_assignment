import { api } from './client';

// Student: their own group's total, submitted, pending, overdue and completion rate.
export const getMyProgress = async () => (await api.get('/analytics/me')).data.progress;

// Admin: totals across all students, groups and assignments.
export const getOverview = async () => (await api.get('/analytics/overview')).data.overview;

// Admin: completion rate per assignment.
export const getAssignmentAnalytics = async () => (await api.get('/analytics/assignments')).data.assignments;

// Admin: completion rate per group, best first.
export const getGroupAnalytics = async () => (await api.get('/analytics/groups')).data.groups;

import { api } from './client';

// The logged-in student's group progress: total, submitted, pending, overdue and completion rate.
export const getMyProgress = async () => (await api.get('/analytics/me')).data.progress;

import { api } from './client';

export const loginRequest = async (credentials) => (await api.post('/auth/login', credentials)).data;

export const registerRequest = async (details) => (await api.post('/auth/register', details)).data;

export const getCurrentUser = async () => (await api.get('/auth/me')).data.user;

import { get, del } from './client';

export const getMySessions = () => get('/auth/sessions');
export const revokeSession = (id) => del(`/auth/sessions/${id}`);

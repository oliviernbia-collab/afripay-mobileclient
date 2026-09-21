import { get, post } from './client';

export const getNotifications = (limit = 50, offset = 0) =>
  get('/notifications', { query: { limit, offset } });

export const markNotificationRead = (id) => post(`/notifications/${id}/lu`);

export const markAllNotificationsRead = () => post('/notifications/tout-lire');

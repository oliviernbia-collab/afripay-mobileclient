import { get, post } from './client';

export const getNotifications = ({ limit = 50, offset = 0, dateDebut, dateFin } = {}) =>
  get('/notifications', { query: { limit, offset, dateDebut, dateFin } });

export const markNotificationRead = (id) => post(`/notifications/${id}/lu`);

export const markAllNotificationsRead = () => post('/notifications/tout-lire');

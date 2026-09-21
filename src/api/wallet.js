import { get } from './client';

export const getMyWallet = () => get('/wallets/me');

export const getMyHistory = (filters = {}) => get('/wallets/me/historique', { query: filters });

export const getMyStats = (period = 'jour') => get('/wallets/me/stats', { query: { period } });

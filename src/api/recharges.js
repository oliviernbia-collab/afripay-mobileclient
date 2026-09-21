import { get, post } from './client';

export const getProviders = () => get('/recharges/fournisseurs', { auth: false });

export const recharge = (fournisseur, montant) => post('/recharges', { fournisseur, montant });

export const getMyRecharges = () => get('/recharges/mes-recharges');

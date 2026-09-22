import { get, post, del } from './client';

export const getProviders = () => get('/recharges/fournisseurs', { auth: false });

export const recharge = (fournisseur, montant, moyenPaiementId) =>
  post('/recharges', { fournisseur, montant, moyenPaiementId });

export const getMyRecharges = () => get('/recharges/mes-recharges');

export const getMyPaymentMethods = (fournisseur) =>
  get('/recharges/moyens-paiement', { query: fournisseur ? { fournisseur } : undefined });

export const addPaymentMethod = ({ fournisseur, identifiant, libelle }) =>
  post('/recharges/moyens-paiement', { fournisseur, identifiant, libelle });

export const removePaymentMethod = (id) => del(`/recharges/moyens-paiement/${id}`);

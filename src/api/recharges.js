import { get, post, del } from './client';

export const getProviders = () => get('/recharges/fournisseurs', { auth: false });

// Taux de frais AfriPay sur la recharge (voir backend/src/services/rechargeService.js) — pour
// afficher un aperçu ("vous recevrez X") avant confirmation, sans dupliquer la valeur en dur ici.
export const getFraisRecharge = () => get('/recharges/frais');

export const recharge = (fournisseur, montant, moyenPaiementId) =>
  post('/recharges', { fournisseur, montant, moyenPaiementId });

export const getMyRecharges = () => get('/recharges/mes-recharges');

export const getMyPaymentMethods = (fournisseur) =>
  get('/recharges/moyens-paiement', { query: fournisseur ? { fournisseur } : undefined });

export const addPaymentMethod = ({ fournisseur, identifiant, libelle }) =>
  post('/recharges/moyens-paiement', { fournisseur, identifiant, libelle });

export const removePaymentMethod = (id) => del(`/recharges/moyens-paiement/${id}`);

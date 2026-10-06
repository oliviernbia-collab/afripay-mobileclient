import { post, get } from './client';

export const MOBILE_MONEY_OPERATORS = ['wave', 'orange_money', 'moov_money', 'mtn_money'];

export const transferInterne = ({ telephoneDestinataire, montant, libelle, pin }) =>
  post('/transferts/interne', { telephoneDestinataire, montant, libelle, pin });

export const transferExterne = ({ opérateurDestination, numéroDestinataire, montant, pin }) =>
  post('/transferts/externe', { opérateurDestination, numéroDestinataire, montant, pin });

// Taux de frais AfriPay sur le retrait (voir backend/src/services/transferService.js) — pour
// afficher un aperçu ("vous recevrez X") avant confirmation, sans dupliquer la valeur en dur ici.
export const getFraisRetrait = () => get('/transferts/frais-retrait');

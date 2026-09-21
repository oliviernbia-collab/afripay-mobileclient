import { post } from './client';

export const transferInterne = ({ telephoneDestinataire, montant, libelle, pin }) =>
  post('/transferts/interne', { telephoneDestinataire, montant, libelle, pin });

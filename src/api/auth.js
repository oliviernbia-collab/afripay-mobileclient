import { get, post } from './client';

export const requestClientOtp = (telephone) =>
  post('/auth/client/otp', { telephone }, { auth: false });

export const registerClient = ({ nom, prenom, telephone, email, motDePasse, otp }) =>
  post('/auth/client/register', { nom, prenom, telephone, email, motDePasse, otp }, { auth: false });

export const loginClient = (telephone, motDePasse) =>
  post('/auth/client/login', { telephone, motDePasse }, { auth: false });

export const setClientPin = (pin) => post('/auth/client/pin', { pin });

export const getMe = () => get('/auth/me');

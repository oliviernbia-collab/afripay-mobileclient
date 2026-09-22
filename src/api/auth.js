import { get, post } from './client';
import { getDeviceInfo } from '../utils/deviceInfo';

export const requestClientOtp = (telephone) =>
  post('/auth/client/otp', { telephone }, { auth: false });

export const registerClient = ({ nom, prenom, telephone, email, motDePasse, otp }) =>
  post('/auth/client/register', { nom, prenom, telephone, email, motDePasse, otp, ...getDeviceInfo() }, { auth: false });

export const loginClient = (telephone, motDePasse) =>
  post('/auth/client/login', { telephone, motDePasse, ...getDeviceInfo() }, { auth: false });

export const setClientPin = (pin) => post('/auth/client/pin', { pin });

export const getMe = () => get('/auth/me');

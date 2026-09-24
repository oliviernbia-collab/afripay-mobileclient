import { get, post, patch } from './client';
import { getDeviceInfo } from '../utils/deviceInfo';

export const requestClientOtp = (telephone) =>
  post('/auth/client/otp', { telephone }, { auth: false });

export const registerClient = ({ nom, prenom, telephone, email, motDePasse, otp }) =>
  post('/auth/client/register', { nom, prenom, telephone, email, motDePasse, otp, ...getDeviceInfo() }, { auth: false });

export const loginClient = (telephone, motDePasse) =>
  post('/auth/client/login', { telephone, motDePasse, ...getDeviceInfo() }, { auth: false });

export const setClientPin = (pin, pinActuel) => post('/auth/client/pin', { pin, pinActuel });

export const changeClientPassword = (motDePasseActuel, motDePasse) =>
  post('/auth/client/password', { motDePasseActuel, motDePasse });

// Code PIN ou mot de passe oubliés — non authentifié (utilisable même sans session valide) :
// vérification par OTP au lieu de l'ancien secret, qui est par définition inconnu.
export const requestResetOtp = (telephone, type) => post('/auth/client/otp-reset', { telephone, type }, { auth: false });

export const resetClientPin = (telephone, otp, pin) =>
  post('/auth/client/reset-pin', { telephone, otp, pin }, { auth: false });

export const resetClientPassword = (telephone, otp, motDePasse) =>
  post('/auth/client/reset-password', { telephone, otp, motDePasse }, { auth: false });

export const getMe = () => get('/auth/me');

// Persists the app's language choice server-side (users.langue) so notifications generated
// later (transfert reçu, décision KYC, etc.) render in the language last picked, even from
// another device.
export const updateClientLanguage = (langue) => patch('/auth/client/langue', { langue });

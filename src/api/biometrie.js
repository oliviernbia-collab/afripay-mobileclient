import { get, post } from './client';

export const enrollPalm = () => post('/biometrie/enroll');

export const getMyPalmCode = () => get('/biometrie/mon-code');

export const getBiometricStatus = () => get('/biometrie/statut');

// Real palm biometric enrolment session (Tencent PalmAI) — see config/features.js. Backend
// returns 503 until a real Tencent tenant is configured.
export const getTencentEnrollSession = () => post('/biometrie/tencent/enroll-session');

export const confirmTencentEnrollment = () => post('/biometrie/tencent/confirm-enrollment');

import { get, post } from './client';

export const enrollPalm = () => post('/biometrie/enroll');

export const getMyPalmCode = () => get('/biometrie/mon-code');

export const getBiometricStatus = () => get('/biometrie/statut');

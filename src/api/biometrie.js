import { get, uploadFile } from './client';

function mimeFromUri(uri) {
  const filename = uri.split('/').pop() || '';
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpg';
  return ext === 'png' ? 'image/png' : 'image/jpeg';
}

// uri: local file uri from expo-image-picker (photo de la paume, capturée à l'appareil).
// L'extraction du gabarit se fait côté serveur, localement (voir backend/palmVisionService.js).
export const enrollPalm = (uri) =>
  uploadFile('/biometrie/enroll', { uri, fieldName: 'photo', mimeType: mimeFromUri(uri) });

export const getMyPalmCode = () => get('/biometrie/mon-code');

export const getBiometricStatus = () => get('/biometrie/statut');

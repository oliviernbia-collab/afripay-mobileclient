import { get, post, del, uploadFile } from './client';

export const getKycStatus = () => get('/kyc/client/statut');

export const submitPersonalInfo = ({ nom, prenom, dateNaissance, adresse }) =>
  post('/kyc/client/informations', { nom, prenom, dateNaissance, adresse });

export const getMyDocuments = () => get('/kyc/client/documents');

function mimeFromUri(uri) {
  const filename = uri.split('/').pop() || '';
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpg';
  return ext === 'png' ? 'image/png' : 'image/jpeg';
}

// uri: local file uri from expo-image-picker. typeDocument: cni|passeport|carte_sejour|selfie
export const uploadDocument = (uri, typeDocument) =>
  uploadFile('/kyc/client/documents', {
    uri,
    fieldName: 'document',
    mimeType: mimeFromUri(uri),
    parameters: { typeDocument },
  });

// uri: local file uri from expo-image-picker (profile photo, section 5.6).
export const uploadMyPhoto = (uri) =>
  uploadFile('/kyc/client/photo', { uri, fieldName: 'photo', mimeType: mimeFromUri(uri) });

export const removeMyPhoto = () => del('/kyc/client/photo');

import { get, post } from './client';

export const getKycStatus = () => get('/kyc/client/statut');

export const submitPersonalInfo = ({ nom, prenom, dateNaissance, adresse }) =>
  post('/kyc/client/informations', { nom, prenom, dateNaissance, adresse });

export const getMyDocuments = () => get('/kyc/client/documents');

// uri: local file uri from expo-image-picker. typeDocument: cni|passeport|carte_sejour|selfie
export const uploadDocument = (uri, typeDocument) => {
  const filename = uri.split('/').pop() || `${typeDocument}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpg';
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

  const form = new FormData();
  form.append('typeDocument', typeDocument);
  form.append('document', { uri, name: filename, type: mime });

  return post('/kyc/client/documents', form, { isForm: true });
};

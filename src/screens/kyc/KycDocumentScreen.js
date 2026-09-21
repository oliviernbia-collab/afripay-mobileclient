import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ScreenContainer from '../../components/ScreenContainer';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import { uploadDocument } from '../../api/kyc';
import { colors, radius } from '../../theme/colors';

const ID_DOC_OPTIONS = [
  { key: 'cni', label: "Carte d'identité" },
  { key: 'passeport', label: 'Passeport' },
  { key: 'carte_sejour', label: 'Carte de séjour' },
];

export default function KycDocumentScreen({ route, navigation }) {
  const initialType = route.params?.typeDocument || 'cni';
  const isSelfie = initialType === 'selfie';
  const title = route.params?.title || "Pièce d'identité";

  const [typeDocument, setTypeDocument] = useState(initialType);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError("Autorisez l'accès à la caméra pour prendre une photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      cameraType: isSelfie ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]) setImageUri(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Autorisez l'accès à la galerie pour choisir une photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]) setImageUri(result.assets[0].uri);
  };

  const onSubmit = async () => {
    setError('');
    if (!imageUri) {
      setError('Ajoutez une photo avant de continuer.');
      return;
    }
    setLoading(true);
    try {
      await uploadDocument(imageUri, typeDocument);
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 900);
    } catch (e) {
      setError(e.message || "Échec de l'envoi du document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{title}</Text>
      <ErrorBanner message={error} />
      {success ? (
        <View style={styles.successRow}>
          <Icon name="circle-check" size={16} color={colors.success} />
          <Text style={styles.successText}>Document envoyé</Text>
        </View>
      ) : null}

      {!isSelfie ? (
        <>
          <Text style={styles.sectionLabel}>Type de document</Text>
          <View style={styles.chipsRow}>
            {ID_DOC_OPTIONS.map((o) => (
              <Pressable
                key={o.key}
                onPress={() => setTypeDocument(o.key)}
                style={[styles.chip, typeDocument === o.key && styles.chipActive]}
              >
                <Text style={[styles.chipText, typeDocument === o.key && styles.chipTextActive]}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.hint}>Prenez une photo claire de votre visage, bien éclairée.</Text>
      )}

      <Card style={styles.previewCard}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <Text style={styles.placeholderText}>Aucune photo sélectionnée</Text>
        )}
      </Card>

      <View style={styles.actionsRow}>
        <GradientButton title="Caméra" onPress={pickFromCamera} variant="outline" style={{ flex: 1, marginRight: 8 }} />
        <GradientButton title="Galerie" onPress={pickFromGallery} variant="outline" style={{ flex: 1, marginLeft: 8 }} />
      </View>

      <GradientButton title="Envoyer le document" onPress={onSubmit} loading={loading} style={{ marginTop: 16 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 10, marginBottom: 16 },
  sectionLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  hint: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, lineHeight: 18 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: colors.magenta, borderColor: colors.magenta },
  chipText: { color: colors.textSecondary, fontSize: 12 },
  chipTextActive: { color: colors.white, fontWeight: '700' },
  previewCard: { height: 200, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 16 },
  preview: { width: '100%', height: '100%', borderRadius: radius.md },
  placeholderText: { color: colors.textSecondary },
  actionsRow: { flexDirection: 'row' },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  successText: { color: colors.success, fontWeight: '700' },
});

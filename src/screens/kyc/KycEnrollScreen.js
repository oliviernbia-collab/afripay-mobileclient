import React, { useCallback, useState } from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { enrollPalm, getBiometricStatus } from '../../api/biometrie';
import { colors } from '../../theme/colors';

export default function KycEnrollScreen({ navigation }) {
  const { t } = useTranslation();
  const [enrolled, setEnrolled] = useState(false);
  const [checking, setChecking] = useState(true);
  // Distingue "confirmé non enrôlé" de "la vérification a échoué" (ex. backend injoignable
  // pendant un redémarrage) — avaler l'erreur et retomber sur `enrolled=false` affichait à tort
  // l'écran "vous devez vous enrôler", donnant l'impression qu'il fallait rescanner sa paume à
  // chaque fois, alors que le gabarit était toujours valide côté serveur.
  const [statusError, setStatusError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [palmCode, setPalmCode] = useState(null);

  const checkStatus = useCallback(() => {
    setChecking(true);
    setStatusError(false);
    getBiometricStatus()
      .then((s) => setEnrolled(s.enrolled))
      .catch(() => setStatusError(true))
      .finally(() => setChecking(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkStatus();
    }, [checkStatus])
  );

  // Capture une vraie photo de la paume (caméra native) puis l'envoie au backend, qui extrait et
  // compare le gabarit localement (voir backend/src/services/palmVisionService.js) — aucune API
  // biométrique externe.
  const onEnroll = async () => {
    setError('');
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError(t('kyc.enroll.cameraPermission'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;

    setLoading(true);
    try {
      const enrollResult = await enrollPalm(result.assets[0].uri);
      setPalmCode(enrollResult.palmCode);
      setEnrolled(true);
    } catch (e) {
      setError(e.message || t('kyc.enroll.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('kyc.enroll.title')}</Text>
      <Text style={styles.subtitle}>{t('kyc.enroll.subtitle')}</Text>

      <ErrorBanner message={error} />

      {checking ? (
        <ActivityIndicator color={colors.white} style={{ marginTop: 30 }} />
      ) : statusError ? (
        <Card>
          <Text style={styles.infoText}>{t('kyc.enroll.statusError')}</Text>
          <GradientButton title={t('kyc.enroll.retry')} onPress={checkStatus} style={{ marginTop: 14 }} />
        </Card>
      ) : enrolled ? (
        <Card style={styles.successCard}>
          <Text style={styles.successTitle}>{t('kyc.enroll.readyTitle')}</Text>
          {palmCode ? <Text style={styles.palmCode}>{palmCode}</Text> : null}
          <Text style={styles.successText}>{t('kyc.enroll.readyText')}</Text>
          <GradientButton
            title={t('kyc.enroll.viewCode')}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Payer' })}
            style={{ marginTop: 14 }}
          />
          <GradientButton
            title={t('kyc.enroll.regenerate')}
            onPress={onEnroll}
            loading={loading}
            variant="outline"
            style={{ marginTop: 10 }}
          />
        </Card>
      ) : (
        <Card>
          <Text style={styles.infoText}>{t('kyc.enroll.infoText')}</Text>
          <GradientButton title={t('kyc.enroll.launch')} onPress={onEnroll} loading={loading} style={{ marginTop: 14 }} />
        </Card>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 10, marginBottom: 10 },
  subtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 20 },
  infoText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  successCard: { borderColor: colors.success, alignItems: 'center' },
  successTitle: { color: colors.success, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  palmCode: { color: colors.white, fontSize: 18, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  successText: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', lineHeight: 17 },
});

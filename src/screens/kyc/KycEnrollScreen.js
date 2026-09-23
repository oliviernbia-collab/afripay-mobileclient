import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import Icon from '../../components/Icon';
import PalmBiometricWebView from '../../components/PalmBiometricWebView';
import {
  enrollPalm,
  getBiometricStatus,
  getTencentEnrollSession,
  confirmTencentEnrollment,
} from '../../api/biometrie';
import { colors } from '../../theme/colors';
import { TENCENT_PALM_ENABLED } from '../../config/features';

// The mockup shows a live camera capture of the palm; there is no real palm
// sensor here (documented in README.md as a mocked capability), so this is a
// purely decorative capture animation that runs before calling the existing
// enrollPalm() mock API — it never pretends to read anything. Once
// TENCENT_PALM_ENABLED is flipped on (see config/features.js), `onEnroll` opens
// the real Tencent PalmAI widget instead of running this animation.
const CAPTURE_DURATION_MS = 1400;

export default function KycEnrollScreen({ navigation }) {
  const { t } = useTranslation();
  const [enrolled, setEnrolled] = useState(false);
  const [checking, setChecking] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [palmCode, setPalmCode] = useState(null);
  const [tencentSession, setTencentSession] = useState(null);
  const captureTimer = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setChecking(true);
      getBiometricStatus()
        .then((s) => setEnrolled(s.enrolled))
        .catch(() => {})
        .finally(() => setChecking(false));
      return () => clearTimeout(captureTimer.current);
    }, [])
  );

  const onEnrollMock = () => {
    setError('');
    setCapturing(true);
    captureTimer.current = setTimeout(async () => {
      setCapturing(false);
      setLoading(true);
      try {
        const result = await enrollPalm();
        setPalmCode(result.palmCode);
        setEnrolled(true);
      } catch (e) {
        setError(e.message || t('kyc.enroll.error'));
      } finally {
        setLoading(false);
      }
    }, CAPTURE_DURATION_MS);
  };

  const onEnrollTencent = async () => {
    setError('');
    setLoading(true);
    try {
      const session = await getTencentEnrollSession();
      setTencentSession(session);
    } catch (e) {
      setError(e.message || t('kyc.enroll.error'));
    } finally {
      setLoading(false);
    }
  };

  const onWebViewResult = async (result) => {
    setTencentSession(null);
    if (result?.code !== 0) {
      setError(result?.message || t('kyc.enroll.error'));
      return;
    }
    setLoading(true);
    try {
      await confirmTencentEnrollment();
      setEnrolled(true);
    } catch (e) {
      setError(e.message || t('kyc.enroll.error'));
    } finally {
      setLoading(false);
    }
  };

  const onEnroll = TENCENT_PALM_ENABLED ? onEnrollTencent : onEnrollMock;

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('kyc.enroll.title')}</Text>
      <Text style={styles.subtitle}>{t('kyc.enroll.subtitle')}</Text>

      <ErrorBanner message={error} />

      {capturing ? (
        <View style={styles.captureFrame}>
          <Icon name="hand" size={72} color={colors.turquoise} />
          <ActivityIndicator color={colors.white} style={{ marginTop: 18 }} />
          <Text style={styles.captureText}>{t('kyc.enroll.capturing')}</Text>
        </View>
      ) : checking ? (
        <ActivityIndicator color={colors.white} style={{ marginTop: 30 }} />
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

      <PalmBiometricWebView
        visible={!!tencentSession}
        session={tencentSession}
        onResult={onWebViewResult}
        onClose={() => setTencentSession(null)}
      />
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
  captureFrame: {
    height: 260,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.turquoise,
    borderStyle: 'dashed',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureText: { color: colors.textSecondary, fontSize: 13, marginTop: 14, fontWeight: '600' },
});

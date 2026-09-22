import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import Icon from '../../components/Icon';
import { enrollPalm, getBiometricStatus } from '../../api/biometrie';
import { colors } from '../../theme/colors';

// The mockup shows a live camera capture of the palm; there is no real palm
// sensor here (documented in README.md as a mocked capability), so this is a
// purely decorative capture animation that runs before calling the existing
// enrollPalm() mock API — it never pretends to read anything.
const CAPTURE_DURATION_MS = 1400;

export default function KycEnrollScreen({ navigation }) {
  const [enrolled, setEnrolled] = useState(false);
  const [checking, setChecking] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [palmCode, setPalmCode] = useState(null);
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

  const onEnroll = () => {
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
        setError(e.message || "L'enrôlement a échoué.");
      } finally {
        setLoading(false);
      }
    }, CAPTURE_DURATION_MS);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Enrôlement de la paume</Text>
      <Text style={styles.subtitle}>
        Dernière étape : nous générons votre code de paiement AfriPay, l&apos;équivalent numérique de votre paume,
        utilisé pour payer chez les marchands sans espèces ni carte.
      </Text>

      <ErrorBanner message={error} />

      {capturing ? (
        <View style={styles.captureFrame}>
          <Icon name="hand" size={72} color={colors.turquoise} />
          <ActivityIndicator color={colors.white} style={{ marginTop: 18 }} />
          <Text style={styles.captureText}>Capture en cours...</Text>
        </View>
      ) : checking ? (
        <ActivityIndicator color={colors.white} style={{ marginTop: 30 }} />
      ) : enrolled ? (
        <Card style={styles.successCard}>
          <Text style={styles.successTitle}>Votre code de paiement AfriPay est prêt</Text>
          {palmCode ? <Text style={styles.palmCode}>{palmCode}</Text> : null}
          <Text style={styles.successText}>
            Rendez-vous sur l&apos;onglet &quot;Payer&quot; pour présenter votre QR code aux marchands AfriPay.
          </Text>
          <GradientButton
            title="Voir mon code de paiement"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Payer' })}
            style={{ marginTop: 14 }}
          />
          <GradientButton
            title="Régénérer le code"
            onPress={onEnroll}
            loading={loading}
            variant="outline"
            style={{ marginTop: 10 }}
          />
        </Card>
      ) : (
        <Card>
          <Text style={styles.infoText}>
            Placez votre main devant la caméra et suivez les instructions pour générer votre code de paiement.
          </Text>
          <GradientButton title="Lancer l'enrôlement" onPress={onEnroll} loading={loading} style={{ marginTop: 14 }} />
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

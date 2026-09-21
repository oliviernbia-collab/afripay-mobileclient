import React, { useCallback, useState } from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { enrollPalm, getBiometricStatus } from '../../api/biometrie';
import { colors } from '../../theme/colors';

export default function KycEnrollScreen({ navigation }) {
  const [enrolled, setEnrolled] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [palmCode, setPalmCode] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setChecking(true);
      getBiometricStatus()
        .then((s) => setEnrolled(s.enrolled))
        .catch(() => {})
        .finally(() => setChecking(false));
    }, [])
  );

  const onEnroll = async () => {
    setError('');
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
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Enrôlement de la paume</Text>
      <Text style={styles.subtitle}>
        Dernière étape : nous générons votre code de paiement AfriPay, l&apos;équivalent numérique de votre paume,
        utilisé pour payer chez les marchands sans espèces ni carte.
      </Text>

      <ErrorBanner message={error} />

      {checking ? (
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
            Aucun enrôlement actif. Appuyez ci-dessous pour générer votre code de paiement.
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
});

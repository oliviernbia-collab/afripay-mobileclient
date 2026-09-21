import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';
import Icon from '../components/Icon';
import { getMyPalmCode } from '../api/biometrie';
import { getMyWallet } from '../api/wallet';
import { colors } from '../theme/colors';
import { formatFcfa } from '../utils/format';
import { ApiError } from '../api/client';

export default function PayerScreen({ navigation }) {
  const [palmCode, setPalmCode] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notEnrolled, setNotEnrolled] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setNotEnrolled(false);
    try {
      const [code, w] = await Promise.all([getMyPalmCode(), getMyWallet()]);
      setPalmCode(code.palmCode);
      setWallet(w);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setNotEnrolled(true);
      } else {
        setError(e.message || 'Impossible de charger votre code de paiement.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Scan de paiement AfriPay</Text>
        <Text style={styles.subtitle}>
          Présentez ce code au terminal du marchand pour payer instantanément, sans espèces ni carte.
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.white} style={{ marginTop: 40 }} />
        ) : notEnrolled ? (
          <Card style={styles.enrollCard}>
            <Text style={styles.enrollTitle}>Code de paiement non disponible</Text>
            <Text style={styles.enrollText}>
              Terminez votre parcours KYC (enrôlement de la paume) pour activer votre code de paiement AfriPay.
            </Text>
            <GradientButton
              title="Compléter mon KYC"
              onPress={() => navigation.navigate('KycHome')}
              style={{ marginTop: 14 }}
            />
          </Card>
        ) : (
          <>
            <Card style={styles.qrCard}>
              {palmCode ? (
                <QRCode value={palmCode} size={230} backgroundColor="white" color={colors.black} />
              ) : null}
              <Text style={styles.codeLabel}>{palmCode}</Text>
            </Card>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Card style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Solde disponible</Text>
              <Text style={styles.balanceValue}>{wallet ? formatFcfa(wallet.solde) : '—'}</Text>
            </Card>

            <Pressable onPress={load} style={styles.refreshBtn}>
              <Icon name="arrows-rotate" size={13} color={colors.blue} />
              <Text style={styles.refreshText}>Actualiser mon code</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: 20, alignItems: 'center' },
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 10, textAlign: 'center' },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  qrCard: { alignItems: 'center', paddingVertical: 28, width: '100%' },
  codeLabel: { color: colors.textSecondary, marginTop: 16, fontSize: 13, letterSpacing: 1 },
  balanceCard: { width: '100%', marginTop: 20, alignItems: 'center' },
  balanceLabel: { color: colors.textSecondary, fontSize: 13 },
  balanceValue: { color: colors.white, fontSize: 26, fontWeight: '800', marginTop: 6 },
  refreshBtn: { marginTop: 20, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshText: { color: colors.blue, fontWeight: '600' },
  errorText: { color: colors.danger, marginTop: 12 },
  enrollCard: { width: '100%', marginTop: 10, borderColor: colors.gold },
  enrollTitle: { color: colors.gold, fontWeight: '700', marginBottom: 8 },
  enrollText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
});

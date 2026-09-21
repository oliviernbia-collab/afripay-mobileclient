import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import StatusBadge from '../../components/StatusBadge';
import { getKycStatus, getMyDocuments } from '../../api/kyc';
import { getBiometricStatus } from '../../api/biometrie';
import { colors, kycStatusColor, kycStatusLabel } from '../../theme/colors';
import { formatFcfa } from '../../utils/format';

const ID_DOC_TYPES = ['cni', 'passeport', 'carte_sejour'];

function StepRow({ done, title, subtitle, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.step}>
      <View style={[styles.stepDot, done ? styles.stepDotDone : styles.stepDotPending]}>
        {done ? <Icon name="check" size={12} color={colors.white} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function KycHomeScreen({ navigation }) {
  const [status, setStatus] = useState(null);
  const [docs, setDocs] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [s, d, b] = await Promise.all([getKycStatus(), getMyDocuments(), getBiometricStatus()]);
      setStatus(s);
      setDocs(d);
      setEnrolled(b.enrolled);
    } catch (e) {
      setError(e.message || 'Impossible de charger votre statut KYC.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const hasIdDoc = docs.some((d) => ID_DOC_TYPES.includes(d.type_document));
  const hasSelfie = docs.some((d) => d.type_document === 'selfie');

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={colors.white} style={{ marginTop: 40 }} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>Vérification d&apos;identité (KYC)</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {status ? (
        <Card style={styles.statusCard}>
          <StatusBadge label={kycStatusLabel(status.statutKyc)} color={kycStatusColor(status.statutKyc)} />
          <Text style={styles.statusText}>
            Recharges cumulées (hors KYC validé) : {formatFcfa(status.rechargeCumulee)} / {formatFcfa(10000)}
          </Text>
          {status.statutKyc === 'rejeté' ? (
            <Text style={styles.statusHint}>
              Votre dossier a été rejeté. Vous pouvez soumettre de nouveaux documents ci-dessous.
            </Text>
          ) : status.statutKyc === 'validé' ? (
            <Text style={styles.statusHintOk}>Votre identité est vérifiée. Plafond de recharge levé.</Text>
          ) : (
            <Text style={styles.statusHint}>
              Votre dossier est en cours d&apos;examen par notre équipe back-office.
            </Text>
          )}
        </Card>
      ) : null}

      <Text style={styles.sectionLabel}>Étapes</Text>
      <Card style={{ paddingVertical: 4 }}>
        <StepRow
          done={!!(status && (status.statutKyc !== 'en_attente' || docs.length > 0))}
          title="1. Informations personnelles"
          subtitle="Nom, date de naissance, adresse"
          onPress={() => navigation.navigate('KycInfo')}
        />
        <StepRow
          done={hasIdDoc}
          title="2. Pièce d'identité"
          subtitle="CNI, passeport ou carte de séjour"
          onPress={() => navigation.navigate('KycDocument', { typeDocument: 'cni', title: "Pièce d'identité" })}
        />
        <StepRow
          done={hasSelfie}
          title="3. Selfie"
          subtitle="Photo de votre visage"
          onPress={() => navigation.navigate('KycDocument', { typeDocument: 'selfie', title: 'Selfie' })}
        />
        <StepRow
          done={enrolled}
          title="4. Enrôlement du paiement"
          subtitle="Génère votre code de paiement AfriPay"
          onPress={() => navigation.navigate('KycEnroll')}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 10, marginBottom: 16 },
  errorText: { color: colors.danger, marginBottom: 12 },
  statusCard: { marginBottom: 20 },
  statusText: { color: colors.white, fontSize: 13, marginTop: 10 },
  statusHint: { color: colors.textSecondary, fontSize: 12, marginTop: 6, lineHeight: 17 },
  statusHintOk: { color: colors.success, fontSize: 12, marginTop: 6, lineHeight: 17 },
  sectionLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepDotDone: { backgroundColor: colors.success },
  stepDotPending: { backgroundColor: colors.border },
  stepTitle: { color: colors.white, fontWeight: '700', fontSize: 13 },
  stepSubtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
});

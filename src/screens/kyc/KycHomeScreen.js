import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      setError(e.message || t('kyc.home.loadError'));
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const hasIdDoc = docs.some((d) => ID_DOC_TYPES.includes(d.type_document));
  const hasSelfie = docs.some((d) => d.type_document === 'selfie');
  const hasPersonalInfo = !!(status && (status.statutKyc !== 'en_attente' || docs.length > 0));
  const stepsDone = [hasPersonalInfo, hasIdDoc, hasSelfie, enrolled].filter(Boolean).length;

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={colors.white} style={{ marginTop: 40 }} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('kyc.home.title')}</Text>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>
          {t('kyc.home.stepLabel', { current: Math.min(stepsDone + 1, 4), total: 4 })}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(stepsDone / 4) * 100}%` }]} />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {status ? (
        <Card style={styles.statusCard}>
          <StatusBadge label={kycStatusLabel(status.statutKyc, t)} color={kycStatusColor(status.statutKyc)} />
          <Text style={styles.statusText}>
            {t('kyc.home.cumulativeRecharge', {
              amount: formatFcfa(status.rechargeCumulee),
              cap: formatFcfa(10000),
            })}
          </Text>
          {status.statutKyc === 'rejeté' ? (
            <Text style={styles.statusHint}>{t('kyc.home.statusRejected')}</Text>
          ) : status.statutKyc === 'validé' ? (
            <Text style={styles.statusHintOk}>{t('kyc.home.statusValidated')}</Text>
          ) : (
            <Text style={styles.statusHint}>{t('kyc.home.statusPending')}</Text>
          )}
        </Card>
      ) : null}

      <Text style={styles.sectionLabel}>{t('kyc.home.stepsLabel')}</Text>
      <Card style={{ paddingVertical: 4 }}>
        <StepRow
          done={hasPersonalInfo}
          title={t('kyc.home.step1Title')}
          subtitle={t('kyc.home.step1Subtitle')}
          onPress={() => navigation.navigate('KycInfo')}
        />
        <StepRow
          done={hasIdDoc}
          title={t('kyc.home.step2Title')}
          subtitle={t('kyc.home.step2Subtitle')}
          onPress={() => navigation.navigate('KycDocument', { typeDocument: 'cni', title: t('kyc.home.step2NavTitle') })}
        />
        <StepRow
          done={hasSelfie}
          title={t('kyc.home.step3Title')}
          subtitle={t('kyc.home.step3Subtitle')}
          onPress={() => navigation.navigate('KycDocument', { typeDocument: 'selfie', title: t('kyc.home.step3NavTitle') })}
        />
        <StepRow
          done={enrolled}
          title={t('kyc.home.step4Title')}
          subtitle={t('kyc.home.step4Subtitle')}
          onPress={() => navigation.navigate('KycEnroll')}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 10, marginBottom: 16 },
  progressRow: { marginBottom: 8 },
  progressLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.success },
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

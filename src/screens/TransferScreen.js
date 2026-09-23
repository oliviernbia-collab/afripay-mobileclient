import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/Input';
import GradientButton from '../components/GradientButton';
import ErrorBanner from '../components/ErrorBanner';
import Card from '../components/Card';
import { transferInterne } from '../api/transferts';
import { colors } from '../theme/colors';
import { formatFcfa } from '../utils/format';

const PIN_THRESHOLD = 50000;

export default function TransferScreen({ navigation }) {
  const { t } = useTranslation();
  const [telephoneDestinataire, setTelephoneDestinataire] = useState('');
  const [montant, setMontant] = useState('');
  const [libelle, setLibelle] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const amount = Number(montant);
  const needsPin = amount >= PIN_THRESHOLD;

  const onSubmit = async () => {
    setError('');
    setSuccess(null);
    if (!telephoneDestinataire.trim()) {
      setError(t('transfer.errors.recipientRequired'));
      return;
    }
    if (!amount || amount <= 0) {
      setError(t('transfer.errors.invalidAmount'));
      return;
    }
    if (needsPin && !/^\d{4,6}$/.test(pin)) {
      setError(t('transfer.errors.pinRequired', { amount: formatFcfa(PIN_THRESHOLD) }));
      return;
    }
    setLoading(true);
    try {
      const result = await transferInterne({
        telephoneDestinataire: telephoneDestinataire.trim(),
        montant: amount,
        libelle: libelle.trim() || undefined,
        pin: needsPin ? pin : undefined,
      });
      setSuccess(result.transaction);
      setMontant('');
      setLibelle('');
      setPin('');
    } catch (e) {
      setError(e.message || t('transfer.errors.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('transfer.title')}</Text>
      <ErrorBanner message={error} />

      {success ? (
        <Card style={styles.successCard}>
          <Text style={styles.successTitle}>{t('transfer.successTitle')}</Text>
          <Text style={styles.successText}>
            {t('transfer.successText', { amount: formatFcfa(success.montant), reference: success.reference })}
          </Text>
        </Card>
      ) : null}

      <Input
        label={t('transfer.recipientLabel')}
        placeholder={t('transfer.recipientPlaceholder')}
        keyboardType="phone-pad"
        value={telephoneDestinataire}
        onChangeText={setTelephoneDestinataire}
      />
      <Input
        label={t('transfer.amountLabel')}
        placeholder={t('transfer.amountPlaceholder')}
        keyboardType="number-pad"
        value={montant}
        onChangeText={setMontant}
      />
      <Input
        label={t('transfer.noteLabel')}
        placeholder={t('transfer.notePlaceholder')}
        value={libelle}
        onChangeText={setLibelle}
      />

      {needsPin ? (
        <>
          <Text style={styles.pinNote}>{t('transfer.pinNote', { amount: formatFcfa(PIN_THRESHOLD) })}</Text>
          <Input
            label={t('transfer.pinLabel')}
            placeholder="••••"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            value={pin}
            onChangeText={setPin}
          />
        </>
      ) : null}

      <GradientButton title={t('transfer.submit')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginBottom: 18 },
  pinNote: { color: colors.gold, fontSize: 12, marginBottom: 10, lineHeight: 17 },
  successCard: { borderColor: colors.success, marginBottom: 16 },
  successTitle: { color: colors.success, fontWeight: '700', marginBottom: 6 },
  successText: { color: colors.white, fontSize: 13 },
});

import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
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
      setError('Saisissez le numéro AfriPay du destinataire.');
      return;
    }
    if (!amount || amount <= 0) {
      setError('Saisissez un montant valide.');
      return;
    }
    if (needsPin && !/^\d{4,6}$/.test(pin)) {
      setError(`Votre code PIN est requis pour les transferts à partir de ${formatFcfa(PIN_THRESHOLD)}.`);
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
      setError(e.message || 'Transfert impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Transférer</Text>
        <ErrorBanner message={error} />

        {success ? (
          <Card style={styles.successCard}>
            <Text style={styles.successTitle}>Transfert envoyé</Text>
            <Text style={styles.successText}>{formatFcfa(success.montant)} — réf. {success.reference}</Text>
          </Card>
        ) : null}

        <Input
          label="Numéro AfriPay du destinataire"
          placeholder="Ex: 0102030405"
          keyboardType="phone-pad"
          value={telephoneDestinataire}
          onChangeText={setTelephoneDestinataire}
        />
        <Input
          label="Montant (FCFA)"
          placeholder="Ex: 2000"
          keyboardType="number-pad"
          value={montant}
          onChangeText={setMontant}
        />
        <Input
          label="Note (optionnelle)"
          placeholder="Ex: Pour le loyer"
          value={libelle}
          onChangeText={setLibelle}
        />

        {needsPin ? (
          <>
            <Text style={styles.pinNote}>
              Ce montant nécessite votre code PIN AfriPay (obligatoire à partir de {formatFcfa(PIN_THRESHOLD)}).
            </Text>
            <Input
              label="Code PIN"
              placeholder="••••"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={pin}
              onChangeText={setPin}
            />
          </>
        ) : null}

        <GradientButton title="Envoyer" onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
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

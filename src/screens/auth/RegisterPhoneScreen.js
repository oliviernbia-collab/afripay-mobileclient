import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { requestClientOtp } from '../../api/auth';
import { colors } from '../../theme/colors';

export default function RegisterPhoneScreen({ navigation }) {
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!telephone.trim()) {
      setError('Veuillez saisir votre numéro de téléphone.');
      return;
    }
    setLoading(true);
    try {
      const result = await requestClientOtp(telephone.trim());
      navigation.navigate('Otp', { telephone: telephone.trim(), devCode: result.devCode });
    } catch (e) {
      setError(e.message || 'Impossible d’envoyer le code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>
        Saisissez votre numéro de téléphone. Nous vous enverrons un code de vérification.
      </Text>
      <ErrorBanner message={error} />
      <Input
        label="Numéro de téléphone"
        placeholder="Ex: 0102030405"
        keyboardType="phone-pad"
        value={telephone}
        onChangeText={setTelephone}
        autoCapitalize="none"
      />
      <GradientButton title="Recevoir le code" onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 30, marginBottom: 10 },
  subtitle: { color: colors.textSecondary, marginBottom: 24, lineHeight: 20 },
});

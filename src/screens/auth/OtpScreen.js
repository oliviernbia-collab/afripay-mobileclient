import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { colors, radius } from '../../theme/colors';

export default function OtpScreen({ route, navigation }) {
  const { telephone, devCode } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const onSubmit = () => {
    if (!otp.trim()) {
      setError('Veuillez saisir le code reçu par SMS.');
      return;
    }
    navigation.navigate('RegisterDetails', { telephone, otp: otp.trim() });
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Vérification</Text>
      <Text style={styles.subtitle}>Un code a été envoyé au {telephone}.</Text>

      {devCode ? (
        <View style={styles.devHint}>
          <Text style={styles.devHintTitle}>Mode développement</Text>
          <Text style={styles.devHintText}>
            Aucun SMS réel n’est envoyé hors production. Code de test : {' '}
            <Text style={{ fontWeight: '800', color: colors.gold }}>{devCode}</Text>
          </Text>
        </View>
      ) : null}

      <ErrorBanner message={error} />
      <Input
        label="Code de vérification"
        placeholder="123456"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />
      <GradientButton title="Continuer" onPress={onSubmit} style={{ marginTop: 8 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 30, marginBottom: 10 },
  subtitle: { color: colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  devHint: {
    backgroundColor: `${colors.gold}18`,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 20,
  },
  devHintTitle: { color: colors.gold, fontWeight: '700', marginBottom: 4, fontSize: 12 },
  devHintText: { color: colors.white, fontSize: 13 },
});

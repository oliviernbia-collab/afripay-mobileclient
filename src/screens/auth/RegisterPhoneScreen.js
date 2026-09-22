import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import Icon from '../../components/Icon';
import { requestClientOtp } from '../../api/auth';
import { colors } from '../../theme/colors';

const comingSoon = (provider) =>
  Alert.alert('Bientôt disponible', `L'inscription via ${provider} arrive dans une prochaine version.`);

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

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Ou s&apos;inscrire avec</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <Pressable style={styles.socialBtn} onPress={() => comingSoon('Google')}>
          <Icon name="google" brand size={18} color={colors.white} />
          <Text style={styles.socialText}>Google</Text>
        </Pressable>
        <Pressable style={styles.socialBtn} onPress={() => comingSoon('Apple')}>
          <Icon name="apple" brand size={18} color={colors.white} />
          <Text style={styles.socialText}>Apple</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 30, marginBottom: 10 },
  subtitle: { color: colors.textSecondary, marginBottom: 24, lineHeight: 20 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textSecondary, fontSize: 12, marginHorizontal: 10 },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  socialText: { color: colors.white, fontWeight: '600', fontSize: 13 },
});

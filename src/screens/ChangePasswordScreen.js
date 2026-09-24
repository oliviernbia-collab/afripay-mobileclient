import React, { useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Input from '../components/Input';
import GradientButton from '../components/GradientButton';
import ErrorBanner from '../components/ErrorBanner';
import { changeClientPassword } from '../api/auth';
import { colors, radius } from '../theme/colors';

// Reachable from l'écran Informations personnelles (KycInfoScreen) — le mot de passe actuel
// est toujours exigé côté backend (POST /auth/client/password) pour empêcher qu'une session
// volée suffise à en prendre le contrôle durable sans jamais l'avoir connu.
export default function ChangePasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const [motDePasseActuel, setMotDePasseActuel] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!motDePasseActuel || !motDePasse) {
      setError(t('changePassword.missingFields'));
      return;
    }
    if (motDePasse.length < 6) {
      setError(t('changePassword.passwordTooShort'));
      return;
    }
    if (motDePasse !== confirmation) {
      setError(t('changePassword.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await changeClientPassword(motDePasseActuel, motDePasse);
      Alert.alert(t('changePassword.successTitle'), t('changePassword.successText'), [
        { text: t('common.ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setError(e.message || t('changePassword.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('changePassword.title')}</Text>
      <ErrorBanner message={error} />
      <Card style={styles.formCard}>
        <Input
          label={t('changePassword.currentLabel')}
          placeholder="••••••••"
          secureTextEntry
          value={motDePasseActuel}
          onChangeText={setMotDePasseActuel}
        />
        <Input
          label={t('changePassword.newLabel')}
          placeholder={t('changePassword.newPlaceholder')}
          secureTextEntry
          value={motDePasse}
          onChangeText={setMotDePasse}
        />
        <Input
          label={t('changePassword.confirmLabel')}
          placeholder="••••••••"
          secureTextEntry
          value={confirmation}
          onChangeText={setConfirmation}
        />
        <GradientButton title={t('changePassword.submit')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 10, marginBottom: 18 },
  formCard: { borderRadius: radius.xl },
});

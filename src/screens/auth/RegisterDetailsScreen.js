import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { useAuth } from '../../context/AuthContext';
import { colors, radius } from '../../theme/colors';

export default function RegisterDetailsScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { telephone, otp } = route.params;
  const { register } = useAuth();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!nom.trim() || !prenom.trim() || !motDePasse) {
      setError(t('auth.registerDetails.missingFields'));
      return;
    }
    if (motDePasse.length < 6) {
      setError(t('auth.registerDetails.passwordTooShort'));
      return;
    }
    if (motDePasse !== confirmation) {
      setError(t('auth.registerDetails.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await register({
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone,
        email: email.trim() || undefined,
        motDePasse,
        otp,
      });
      navigation.reset({ index: 0, routes: [{ name: 'PinSetup' }] });
    } catch (e) {
      setError(e.message || t('auth.registerDetails.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('auth.registerDetails.title')}</Text>
      <ErrorBanner message={error} />
      <Card style={styles.formCard}>
        <Input
          label={t('auth.registerDetails.nameLabel')}
          placeholder={t('auth.registerDetails.namePlaceholder')}
          value={nom}
          onChangeText={setNom}
        />
        <Input
          label={t('auth.registerDetails.firstNameLabel')}
          placeholder={t('auth.registerDetails.firstNamePlaceholder')}
          value={prenom}
          onChangeText={setPrenom}
        />
        <Input
          label={t('auth.registerDetails.emailLabel')}
          placeholder="awa@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label={t('auth.registerDetails.passwordLabel')}
          placeholder={t('auth.registerDetails.passwordPlaceholder')}
          secureTextEntry
          value={motDePasse}
          onChangeText={setMotDePasse}
        />
        <Input
          label={t('auth.registerDetails.confirmLabel')}
          placeholder="••••••••"
          secureTextEntry
          value={confirmation}
          onChangeText={setConfirmation}
        />
        <GradientButton title={t('auth.registerDetails.submit')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 30, marginBottom: 18 },
  formCard: { borderRadius: radius.xl },
});

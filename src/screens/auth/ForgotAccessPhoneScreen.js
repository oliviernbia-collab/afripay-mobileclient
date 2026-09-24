import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { requestResetOtp } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { colors, radius } from '../../theme/colors';

// Étape 1 de "code PIN / mot de passe oublié(s)" (route.params.type: 'pin' | 'password').
// Pour le PIN, l'utilisateur est déjà connecté (venu de Paramètres) : son numéro est donc connu
// et non modifiable, ce qui évite une saisie inutile et empêche de réinitialiser le PIN d'un
// autre numéro que celui du compte ouvert.
export default function ForgotAccessPhoneScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { type } = route.params;
  const { user } = useAuth();
  const isPin = type === 'pin';
  const [telephone, setTelephone] = useState(isPin ? user?.telephone || '' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!telephone.trim()) {
      setError(t('forgotAccess.missingPhone'));
      return;
    }
    setLoading(true);
    try {
      const result = await requestResetOtp(telephone.trim(), type);
      navigation.navigate('ForgotAccessReset', { type, telephone: telephone.trim(), devCode: result.devCode });
    } catch (e) {
      setError(e.message || t('forgotAccess.otpError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{isPin ? t('forgotAccess.titlePin') : t('forgotAccess.titlePassword')}</Text>
      <Text style={styles.subtitle}>{isPin ? t('forgotAccess.subtitlePin') : t('forgotAccess.subtitlePassword')}</Text>
      <ErrorBanner message={error} />
      <Card style={styles.formCard}>
        <Input
          label={t('forgotAccess.phoneLabel')}
          placeholder={t('forgotAccess.phonePlaceholder')}
          keyboardType="phone-pad"
          value={telephone}
          onChangeText={setTelephone}
          autoCapitalize="none"
          editable={!isPin}
        />
        <GradientButton title={t('forgotAccess.sendCode')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 30, marginBottom: 10 },
  subtitle: { color: colors.textSecondary, marginBottom: 24, lineHeight: 20 },
  formCard: { borderRadius: radius.xl },
});

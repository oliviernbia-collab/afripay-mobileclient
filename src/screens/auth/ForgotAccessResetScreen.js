import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { useToast } from '../../context/ToastContext';
import { resetClientPin, resetClientPassword } from '../../api/auth';
import { colors, radius } from '../../theme/colors';

// Étape 2 : code reçu par SMS + nouveau secret. Le mot de passe réinitialisé révoque aussi
// toutes les sessions actives côté backend (voir API_CONTRACT.md) — l'utilisateur devra donc se
// reconnecter, d'où le retour à l'écran de connexion plutôt qu'une reconnexion automatique.
export default function ForgotAccessResetScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { showSuccess } = useToast();
  const { type, telephone, devCode } = route.params;
  const isPin = type === 'pin';
  const [otp, setOtp] = useState('');
  const [secret, setSecret] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!otp.trim()) {
      setError(t('forgotAccess.missingCode'));
      return;
    }
    if (isPin ? !/^\d{4,6}$/.test(secret) : secret.length < 6) {
      setError(isPin ? t('forgotAccess.pinInvalid') : t('forgotAccess.passwordTooShort'));
      return;
    }
    if (secret !== confirmation) {
      setError(t('forgotAccess.mismatch'));
      return;
    }
    setLoading(true);
    try {
      if (isPin) {
        await resetClientPin(telephone, otp.trim(), secret);
        showSuccess(t('forgotAccess.successTextPin'));
        // Revient à Paramètres (Paramètres -> PinSetup -> ForgotAccessPhone -> ici) plutôt
        // qu'à l'étape "PIN actuel" de PinSetup, désormais sans objet puisque le PIN vient
        // d'être remplacé par cette réinitialisation.
        navigation.pop(3);
      } else {
        await resetClientPassword(telephone, otp.trim(), secret);
        showSuccess(t('forgotAccess.successTextPassword'));
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    } catch (e) {
      setError(e.message || t('forgotAccess.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{isPin ? t('forgotAccess.resetTitlePin') : t('forgotAccess.resetTitlePassword')}</Text>
      <Text style={styles.subtitle}>{t('forgotAccess.resetSubtitle', { phone: telephone })}</Text>

      {devCode ? (
        <View style={styles.devHint}>
          <Text style={styles.devHintTitle}>{t('auth.otp.devModeTitle')}</Text>
          <Text style={styles.devHintText}>
            {t('auth.otp.devModeText')} <Text style={{ fontWeight: '800', color: colors.gold }}>{devCode}</Text>
          </Text>
        </View>
      ) : null}

      <ErrorBanner message={error} />
      <Card style={styles.formCard}>
        <Input
          label={t('forgotAccess.codeLabel')}
          placeholder="123456"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
        />
        <Input
          label={isPin ? t('forgotAccess.newPinLabel') : t('forgotAccess.newPasswordLabel')}
          placeholder={isPin ? '••••' : t('forgotAccess.newPasswordPlaceholder')}
          keyboardType={isPin ? 'number-pad' : 'default'}
          secureTextEntry
          maxLength={isPin ? 6 : undefined}
          value={secret}
          onChangeText={setSecret}
        />
        <Input
          label={t('forgotAccess.confirmLabel')}
          placeholder={isPin ? '••••' : '••••••••'}
          keyboardType={isPin ? 'number-pad' : 'default'}
          secureTextEntry
          maxLength={isPin ? 6 : undefined}
          value={confirmation}
          onChangeText={setConfirmation}
        />
        <GradientButton title={t('forgotAccess.submit')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 30, marginBottom: 10 },
  subtitle: { color: colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  formCard: { borderRadius: radius.xl },
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

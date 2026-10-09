import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { requestClientOtp } from '../../api/auth';
import { colors, radius } from '../../theme/colors';

export default function RegisterPhoneScreen({ navigation }) {
  const { t } = useTranslation();
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!telephone.trim()) {
      setError(t('auth.registerPhone.missingPhone'));
      return;
    }
    setLoading(true);
    try {
      const result = await requestClientOtp(telephone.trim());
      navigation.navigate('Otp', { telephone: telephone.trim(), devCode: result.devCode });
    } catch (e) {
      setError(e.message || t('auth.registerPhone.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('auth.registerPhone.title')}</Text>
      <Text style={styles.subtitle}>{t('auth.registerPhone.subtitle')}</Text>
      <ErrorBanner message={error} />
      <Card style={styles.formCard}>
        <Input
          label={t('auth.registerPhone.phoneLabel')}
          placeholder={t('auth.registerPhone.phonePlaceholder')}
          keyboardType="phone-pad"
          value={telephone}
          onChangeText={setTelephone}
          autoCapitalize="none"
        />
        <GradientButton title={t('auth.registerPhone.submit')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 30, marginBottom: 10 },
  subtitle: { color: colors.textSecondary, marginBottom: 24, lineHeight: 20 },
  formCard: { borderRadius: radius.xl },
});

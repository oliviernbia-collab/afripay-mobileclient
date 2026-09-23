import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { colors, radius } from '../../theme/colors';

export default function OtpScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { telephone, devCode } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const onSubmit = () => {
    if (!otp.trim()) {
      setError(t('auth.otp.missingCode'));
      return;
    }
    navigation.navigate('RegisterDetails', { telephone, otp: otp.trim() });
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('auth.otp.title')}</Text>
      <Text style={styles.subtitle}>{t('auth.otp.subtitle', { phone: telephone })}</Text>

      {devCode ? (
        <View style={styles.devHint}>
          <Text style={styles.devHintTitle}>{t('auth.otp.devModeTitle')}</Text>
          <Text style={styles.devHintText}>
            {t('auth.otp.devModeText')} <Text style={{ fontWeight: '800', color: colors.gold }}>{devCode}</Text>
          </Text>
        </View>
      ) : null}

      <ErrorBanner message={error} />
      <Input
        label={t('auth.otp.codeLabel')}
        placeholder="123456"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />
      <GradientButton title={t('auth.otp.continue')} onPress={onSubmit} style={{ marginTop: 8 }} />
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

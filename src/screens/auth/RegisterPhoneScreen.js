import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import Icon from '../../components/Icon';
import { requestClientOtp } from '../../api/auth';
import { colors } from '../../theme/colors';

export default function RegisterPhoneScreen({ navigation }) {
  const { t } = useTranslation();
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const comingSoon = (provider) =>
    Alert.alert(t('auth.registerPhone.comingSoonTitle'), t('auth.registerPhone.comingSoonText', { provider }));

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
      <Input
        label={t('auth.registerPhone.phoneLabel')}
        placeholder={t('auth.registerPhone.phonePlaceholder')}
        keyboardType="phone-pad"
        value={telephone}
        onChangeText={setTelephone}
        autoCapitalize="none"
      />
      <GradientButton title={t('auth.registerPhone.submit')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t('auth.registerPhone.orRegisterWith')}</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <Pressable style={styles.socialBtn} onPress={() => comingSoon(t('auth.registerPhone.google'))}>
          <Icon name="google" brand size={18} color={colors.white} />
          <Text style={styles.socialText}>{t('auth.registerPhone.google')}</Text>
        </Pressable>
        <Pressable style={styles.socialBtn} onPress={() => comingSoon(t('auth.registerPhone.apple'))}>
          <Icon name="apple" brand size={18} color={colors.white} />
          <Text style={styles.socialText}>{t('auth.registerPhone.apple')}</Text>
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

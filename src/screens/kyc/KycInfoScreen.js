import React, { useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import Icon from '../../components/Icon';
import { submitPersonalInfo } from '../../api/kyc';
import { useAuth } from '../../context/AuthContext';
import { colors, radius } from '../../theme/colors';

export default function KycInfoScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [nom, setNom] = useState(user?.nom || '');
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [dateNaissance, setDateNaissance] = useState(user?.date_naissance || '');
  const [adresse, setAdresse] = useState(user?.adresse || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await submitPersonalInfo({ nom, prenom, dateNaissance: dateNaissance || undefined, adresse: adresse || undefined });
      await refreshUser();
      navigation.goBack();
    } catch (e) {
      setError(e.message || t('kyc.info.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('kyc.info.title')}</Text>
      <ErrorBanner message={error} />
      <Card style={styles.formCard}>
        <Input label={t('kyc.info.nameLabel')} value={nom} onChangeText={setNom} />
        <Input label={t('kyc.info.firstNameLabel')} value={prenom} onChangeText={setPrenom} />
        <Input
          label={t('kyc.info.birthDateLabel')}
          placeholder={t('kyc.info.birthDatePlaceholder')}
          value={dateNaissance}
          onChangeText={setDateNaissance}
        />
        <Input
          label={t('kyc.info.addressLabel')}
          placeholder={t('kyc.info.addressPlaceholder')}
          value={adresse}
          onChangeText={setAdresse}
        />
        <Pressable style={styles.changePassword} onPress={() => navigation.navigate('ChangePassword')}>
          <Icon name="key" size={15} color={colors.turquoise} />
          <Text style={styles.changePasswordLabel}>{t('kyc.info.changePassword')}</Text>
          <Icon name="chevron-right" size={16} color={colors.textSecondary} />
        </Pressable>

        <GradientButton title={t('kyc.info.save')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 10, marginBottom: 18 },
  formCard: { borderRadius: radius.xl },
  changePassword: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  changePasswordLabel: { flex: 1, color: colors.white, fontSize: 14, fontWeight: '600', marginLeft: 10 },
});

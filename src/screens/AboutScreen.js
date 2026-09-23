import React from 'react';
import { Text, StyleSheet, Pressable, Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/ScreenContainer';
import BrandHeader from '../components/BrandHeader';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { colors } from '../theme/colors';
import appConfig from '../../app.json';

const CONTACT_EMAIL = 'olivier@africorpgroup.tech';

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <BrandHeader size="compact" showTagline />
        <Text style={styles.version}>{t('about.version', { version: appConfig.expo.version })}</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.description}>{t('about.description')}</Text>
      </Card>

      <Text style={styles.sectionLabel}>{t('about.contactLabel')}</Text>
      <Card style={{ paddingVertical: 4 }}>
        <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} style={styles.row}>
          <View style={styles.rowIcon}>
            <Icon name="envelope" size={15} color={colors.turquoise} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{t('about.emailLabel')}</Text>
            <Text style={styles.rowValue}>{CONTACT_EMAIL}</Text>
          </View>
          <Icon name="chevron-right" size={15} color={colors.textSecondary} />
        </Pressable>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: 10, marginBottom: 24 },
  version: { color: colors.textSecondary, fontSize: 12.5, marginTop: 12 },
  card: { marginBottom: 20 },
  description: { color: colors.textSecondary, fontSize: 13.5, lineHeight: 20, textAlign: 'center' },
  sectionLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: `${colors.turquoise}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: { color: colors.textSecondary, fontSize: 11.5 },
  rowValue: { color: colors.white, fontSize: 14, fontWeight: '600', marginTop: 2 },
});

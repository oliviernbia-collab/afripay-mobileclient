import React from 'react';
import { Text, StyleSheet, ScrollView, Pressable, Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { colors } from '../theme/colors';

const CONTACT_EMAIL = 'olivier@africorpgroup.tech';

export default function SupportScreen() {
  const { t } = useTranslation();
  const faq = t('support.faq', { returnObjects: true });

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('support.title')}</Text>

        <Card style={{ paddingVertical: 4, marginBottom: 20 }}>
          <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Icon name="envelope" size={15} color={colors.turquoise} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>{t('about.contactLabel')}</Text>
              <Text style={styles.contactValue}>{CONTACT_EMAIL}</Text>
            </View>
            <Icon name="chevron-right" size={15} color={colors.textSecondary} />
          </Pressable>
        </Card>

        <Text style={styles.sectionLabel}>{t('support.faqSectionLabel')}</Text>
        {faq.map((item) => (
          <Card key={item.q} style={styles.card}>
            <Text style={styles.question}>{item.q}</Text>
            <Text style={styles.answer}>{item.a}</Text>
          </Card>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 10, marginBottom: 18 },
  sectionLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  card: { marginBottom: 12 },
  question: { color: colors.white, fontWeight: '700', marginBottom: 6 },
  answer: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  contactIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: `${colors.turquoise}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactLabel: { color: colors.textSecondary, fontSize: 11.5 },
  contactValue: { color: colors.white, fontSize: 14, fontWeight: '600', marginTop: 2 },
});

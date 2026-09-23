import React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from './ScreenContainer';
import { colors } from '../theme/colors';

// Renders a titled legal document (Terms of use, Privacy policy) from an i18n namespace shaped
// as { title, lastUpdated, intro, sections: [{ title, body }] } — see TermsScreen/PrivacyScreen.
export default function LegalDocument({ namespaceKey }) {
  const { t } = useTranslation();
  const sections = t(`${namespaceKey}.sections`, { returnObjects: true });

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t(`${namespaceKey}.title`)}</Text>
        <Text style={styles.lastUpdated}>{t(`${namespaceKey}.lastUpdated`)}</Text>
        <Text style={styles.intro}>{t(`${namespaceKey}.intro`)}</Text>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  lastUpdated: { color: colors.textSecondary, fontSize: 12, marginBottom: 16 },
  intro: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 22, fontStyle: 'italic' },
  section: { marginBottom: 18 },
  sectionTitle: { color: colors.white, fontWeight: '700', fontSize: 14, marginBottom: 6 },
  sectionBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
});

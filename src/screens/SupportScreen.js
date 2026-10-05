import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, Pressable, Linking, View, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { colors, radius } from '../theme/colors';

const CONTACT_EMAIL = 'olivier@africorpgroup.tech';

export default function SupportScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  // Index figé AVANT filtrage par la recherche, pour que l'accordéon ouvert reste stable même
  // si la liste filtrée change de longueur (sinon `openIndex` pointerait sur le mauvais item).
  const faq = t('support.faq', { returnObjects: true }).map((item, index) => ({ ...item, index }));
  const needle = query.trim().toLowerCase();
  const filteredFaq = needle
    ? faq.filter((item) => item.q.toLowerCase().includes(needle) || item.a.toLowerCase().includes(needle))
    : faq;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>{t('support.greeting')}</Text>
        <Text style={styles.title}>{t('support.title')}</Text>

        <Card style={{ paddingVertical: 4, marginBottom: 16 }}>
          <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Icon name="paper-plane" size={15} color={colors.turquoise} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>{t('support.sendMessageLabel')}</Text>
              <Text style={styles.contactValue}>{CONTACT_EMAIL}</Text>
            </View>
            <Icon name="chevron-right" size={15} color={colors.textSecondary} />
          </Pressable>
        </Card>

        <View style={styles.searchRow}>
          <Icon name="magnifying-glass" size={15} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('support.searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
          />
        </View>

        <Text style={styles.sectionLabel}>{t('support.faqSectionLabel')}</Text>
        {filteredFaq.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('support.noResultsTitle')}</Text>
            <Text style={styles.emptyText}>{t('support.noResultsText')}</Text>
          </Card>
        ) : (
          filteredFaq.map((item) => {
            const open = openIndex === item.index;
            return (
              <Pressable key={item.q} onPress={() => setOpenIndex(open ? null : item.index)}>
                <Card style={styles.card}>
                  <View style={styles.faqHeader}>
                    <Text style={styles.question}>{item.q}</Text>
                    <Icon name={open ? 'chevron-up' : 'chevron-down'} size={15} color={colors.textSecondary} />
                  </View>
                  {open ? <Text style={styles.answer}>{item.a}</Text> : null}
                </Card>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  title: { color: colors.white, fontSize: 22, fontWeight: '700', lineHeight: 28, marginBottom: 20 },
  sectionLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  card: { marginBottom: 12 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  question: { flex: 1, color: colors.white, fontWeight: '700', marginRight: 8 },
  answer: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 10 },
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  searchInput: { flex: 1, color: colors.white, fontSize: 14, paddingVertical: 13 },
  emptyCard: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { color: colors.white, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, textAlign: 'center' },
});

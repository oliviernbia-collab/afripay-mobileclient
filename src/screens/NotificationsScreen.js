import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { ApiError } from '../api/client';
import { enqueueMarkRead } from '../utils/offlineReadQueue';
import { colors } from '../theme/colors';
import { formatDate } from '../utils/format';

const TYPE_ICONS = {
  transaction: { icon: 'money-bill-transfer', color: colors.turquoise },
  sécurité: { icon: 'shield-halved', color: colors.red },
  système: { icon: 'circle-info', color: colors.blue },
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('toutes');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getNotifications();
      setItems(data);
    } catch (e) {
      setError(e.message || t('notifications.loadError'));
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onPressItem = async (item) => {
    if (item.lu) return;
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, lu: 1 } : n)));
    try {
      await markNotificationRead(item.id);
    } catch (e) {
      if (e instanceof ApiError) {
        // Le serveur a répondu et a refusé — l'optimisme n'était pas justifié, on revient en arrière.
        setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, lu: 0 } : n)));
      } else {
        // Échec réseau (fetch a rejeté avant même d'atteindre le serveur) : on garde l'affichage
        // "lu" tel que l'utilisateur l'a vu, et on met l'action de côté pour la rejouer dès que la
        // connexion revient (voir utils/offlineReadQueue.js) plutôt que de la perdre silencieusement.
        await enqueueMarkRead(item.id);
      }
    }
  };

  const onMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, lu: 1 })));
    try {
      await markAllNotificationsRead();
    } catch {
      load();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('notifications.title')}</Text>
        <Pressable onPress={onMarkAll}>
          <Text style={styles.markAll}>{t('notifications.markAllRead')}</Text>
        </Pressable>
      </View>

      <View style={styles.tabsRow}>
        {[
          { key: 'toutes', labelKey: 'notifications.tabAll' },
          { key: 'non_lues', labelKey: 'notifications.tabUnread' },
        ].map((tabItem) => (
          <Pressable
            key={tabItem.key}
            onPress={() => setTab(tabItem.key)}
            style={[styles.tab, tab === tabItem.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === tabItem.key && styles.tabTextActive]}>{t(tabItem.labelKey)}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.white} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={tab === 'non_lues' ? items.filter((n) => !n.lu) : items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {tab === 'non_lues' ? t('notifications.emptyUnread') : t('notifications.emptyAll')}
            </Text>
          }
          renderItem={({ item }) => {
            const typeStyle = TYPE_ICONS[item.type] || { icon: 'bell', color: colors.turquoise };
            return (
              <Pressable onPress={() => onPressItem(item)}>
                <Card style={[styles.row, !item.lu && styles.rowUnread]}>
                  <View style={styles.rowLayout}>
                    <View style={[styles.typeIcon, { backgroundColor: `${typeStyle.color}22` }]}>
                      <Icon name={typeStyle.icon} size={15} color={typeStyle.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.rowTop}>
                        {!item.lu ? <View style={styles.dot} /> : null}
                        <Text style={styles.rowTitle}>{item.titre}</Text>
                      </View>
                      <Text style={styles.rowContent}>{item.contenu}</Text>
                      <Text style={styles.rowDate}>{formatDate(item.date_creation || item.date_envoi)}</Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: colors.white, fontSize: 22, fontWeight: '700' },
  markAll: { color: colors.blue, fontSize: 13 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 14, gap: 10 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  tabText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: colors.white },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  row: { marginBottom: 10 },
  rowUnread: { borderColor: colors.magenta },
  rowLayout: { flexDirection: 'row', alignItems: 'flex-start' },
  typeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.magenta, marginRight: 8 },
  rowTitle: { color: colors.white, fontWeight: '700' },
  rowContent: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  rowDate: { color: colors.textSecondary, fontSize: 11, marginTop: 6 },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
  errorText: { color: colors.danger, paddingHorizontal: 20, marginBottom: 8 },
});

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { colors } from '../theme/colors';
import { formatDate } from '../utils/format';

export default function NotificationsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getNotifications();
      setItems(data);
    } catch (e) {
      setError(e.message || 'Impossible de charger les notifications.');
    }
  }, []);

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
    } catch {
      // best-effort — revert on failure
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, lu: 0 } : n)));
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
        <Text style={styles.title}>Notifications</Text>
        <Pressable onPress={onMarkAll}>
          <Text style={styles.markAll}>Tout marquer lu</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.white} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucune notification.</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => onPressItem(item)}>
              <Card style={[styles.row, !item.lu && styles.rowUnread]}>
                <View style={styles.rowTop}>
                  {!item.lu ? <View style={styles.dot} /> : null}
                  <Text style={styles.rowTitle}>{item.titre}</Text>
                </View>
                <Text style={styles.rowContent}>{item.contenu}</Text>
                <Text style={styles.rowDate}>{formatDate(item.date_creation || item.date_envoi)}</Text>
              </Card>
            </Pressable>
          )}
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
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  row: { marginBottom: 10 },
  rowUnread: { borderColor: colors.magenta },
  rowTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.magenta, marginRight: 8 },
  rowTitle: { color: colors.white, fontWeight: '700' },
  rowContent: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  rowDate: { color: colors.textSecondary, fontSize: 11, marginTop: 6 },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
  errorText: { color: colors.danger, paddingHorizontal: 20, marginBottom: 8 },
});

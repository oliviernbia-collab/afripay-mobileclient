import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import { getMyHistory } from '../api/wallet';
import { colors, radius, statutColor, txTypeLabel, txMethodLabel } from '../theme/colors';
import { formatFcfa, formatDate } from '../utils/format';

const TYPE_CHIPS = [
  { key: undefined, label: 'Tous' },
  { key: 'achat', label: 'Achats' },
  { key: 'recharge', label: 'Recharges' },
  { key: 'transfert', label: 'Transferts' },
];

const STATUT_CHIPS = [
  { key: undefined, label: 'Tous statuts' },
  { key: 'réussi', label: 'Réussi' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'échoué', label: 'Échoué' },
];

export default function HistoriqueScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [type, setType] = useState(undefined);
  const [statut, setStatut] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (filters) => {
    setError('');
    try {
      const data = await getMyHistory({ type: filters.type, statut: filters.statut, limit: 100 });
      setItems(data);
    } catch (e) {
      setError(e.message || 'Impossible de charger l’historique.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load({ type, statut }).finally(() => setLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, statut])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load({ type, statut });
    setRefreshing(false);
  };

  const Chip = ({ active, label, onPress }) => (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
      </View>

      <View style={styles.chipsRow}>
        {TYPE_CHIPS.map((c) => (
          <Chip key={c.label} label={c.label} active={type === c.key} onPress={() => setType(c.key)} />
        ))}
      </View>
      <View style={styles.chipsRow}>
        {STATUT_CHIPS.map((c) => (
          <Chip key={c.label} label={c.label} active={statut === c.key} onPress={() => setStatut(c.key)} />
        ))}
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
          ListEmptyComponent={<Text style={styles.emptyText}>Aucune transaction trouvée.</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('HistoriqueDetail', { transaction: item })}>
              <Card style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.libelle || txTypeLabel(item.type)}</Text>
                  <Text style={styles.rowSubtitle}>{txMethodLabel(item.méthode)}</Text>
                  <Text style={styles.rowDate}>{formatDate(item.date_heure)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.rowAmount}>{formatFcfa(item.montant)}</Text>
                  <Text style={[styles.rowStatus, { color: statutColor(item.statut) }]}>{item.statut}</Text>
                </View>
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
  header: { paddingHorizontal: 20, paddingTop: 10 },
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginBottom: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  chipText: { color: colors.textSecondary, fontSize: 12 },
  chipTextActive: { color: colors.white, fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowTitle: { color: colors.white, fontWeight: '600' },
  rowSubtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  rowDate: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  rowAmount: { color: colors.white, fontWeight: '700' },
  rowStatus: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
  errorText: { color: colors.danger, paddingHorizontal: 20, marginBottom: 8 },
});

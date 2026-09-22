import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import TxTypeIcon from '../components/TxTypeIcon';
import { getMyHistory } from '../api/wallet';
import { colors, radius, statutColor, txTypeLabel, txMethodLabel } from '../theme/colors';
import { formatFcfa, formatDate } from '../utils/format';

const TYPE_CHIPS = [
  { key: undefined, label: 'Toutes' },
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

// Filtre par période (cahier des charges 5.5 "Filtres par type d'opération, période et
// statut") — plages calculées côté client, envoyées en dateDebut/dateFin (déjà supportés par
// GET /wallets/me/historique).
function periodRange(key) {
  if (!key) return {};
  const now = new Date();
  const toDateStr = (d) => d.toISOString().slice(0, 10);
  if (key === 'jour') return { dateDebut: toDateStr(now), dateFin: toDateStr(now) };
  if (key === '7j') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { dateDebut: toDateStr(start), dateFin: toDateStr(now) };
  }
  if (key === 'mois') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { dateDebut: toDateStr(start), dateFin: toDateStr(now) };
  }
  return {};
}

const PERIOD_CHIPS = [
  { key: undefined, label: 'Toute période' },
  { key: 'jour', label: "Aujourd'hui" },
  { key: '7j', label: '7 derniers jours' },
  { key: 'mois', label: 'Ce mois' },
];

export default function HistoriqueScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [type, setType] = useState(undefined);
  const [statut, setStatut] = useState(undefined);
  const [period, setPeriod] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (filters) => {
    setError('');
    try {
      const data = await getMyHistory({ type: filters.type, statut: filters.statut, ...periodRange(filters.period), limit: 100 });
      setItems(data);
    } catch (e) {
      setError(e.message || 'Impossible de charger l’historique.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load({ type, statut, period }).finally(() => setLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, statut, period])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load({ type, statut, period });
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
      <View style={styles.chipsRow}>
        {PERIOD_CHIPS.map((c) => (
          <Chip key={c.label} label={c.label} active={period === c.key} onPress={() => setPeriod(c.key)} />
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
                <TxTypeIcon type={item.type} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.rowTitle}>{item.libelle || txTypeLabel(item.type)}</Text>
                  <Text style={styles.rowSubtitle}>{txMethodLabel(item.méthode)}</Text>
                  <Text style={styles.rowDate}>{formatDate(item.date_heure)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.rowAmount, { color: item.type === 'recharge' ? colors.green : colors.white }]}>
                    {item.type === 'recharge' ? '+' : '-'}
                    {formatFcfa(item.montant)}
                  </Text>
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  rowTitle: { color: colors.white, fontWeight: '600' },
  rowSubtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  rowDate: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  rowAmount: { color: colors.white, fontWeight: '700' },
  rowStatus: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
  errorText: { color: colors.danger, paddingHorizontal: 20, marginBottom: 8 },
});

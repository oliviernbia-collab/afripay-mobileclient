import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import TxTypeIcon from '../components/TxTypeIcon';
import { getMyHistory, getMyWallet } from '../api/wallet';
import { colors, radius, statutColor, statutLabel, txDisplayTitle, txMethodLabel } from '../theme/colors';
import { formatFcfa, formatDate } from '../utils/format';

const TYPE_CHIPS = [
  { key: undefined, labelKey: 'historique.typeAll' },
  { key: 'achat', labelKey: 'historique.typePurchases' },
  { key: 'recharge', labelKey: 'historique.typeRecharges' },
  { key: 'transfert', labelKey: 'historique.typeTransfers' },
];

const STATUT_CHIPS = [
  { key: undefined, labelKey: 'historique.statusAll' },
  { key: 'réussi', labelKey: 'historique.statusSuccess' },
  { key: 'en_attente', labelKey: 'historique.statusPending' },
  { key: 'échoué', labelKey: 'historique.statusFailed' },
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
  { key: undefined, labelKey: 'historique.periodAll' },
  { key: 'jour', labelKey: 'historique.periodToday' },
  { key: '7j', labelKey: 'historique.periodLast7' },
  { key: 'mois', labelKey: 'historique.periodThisMonth' },
];

export default function HistoriqueScreen({ navigation }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [walletId, setWalletId] = useState(null);
  const [type, setType] = useState(undefined);
  const [statut, setStatut] = useState(undefined);
  const [period, setPeriod] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (filters) => {
    setError('');
    try {
      const [data, wallet] = await Promise.all([
        getMyHistory({ type: filters.type, statut: filters.statut, ...periodRange(filters.period), limit: 100 }),
        getMyWallet(),
      ]);
      setItems(data);
      setWalletId(wallet.id);
    } catch (e) {
      setError(e.message || t('historique.loadError'));
    }
  }, [t]);

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
        <Text style={styles.title}>{t('historique.title')}</Text>
      </View>

      <Card style={styles.filtersCard}>
        <View style={styles.chipsRow}>
          {TYPE_CHIPS.map((c) => (
            <Chip key={c.labelKey} label={t(c.labelKey)} active={type === c.key} onPress={() => setType(c.key)} />
          ))}
        </View>
        <View style={styles.chipsRow}>
          {STATUT_CHIPS.map((c) => (
            <Chip key={c.labelKey} label={t(c.labelKey)} active={statut === c.key} onPress={() => setStatut(c.key)} />
          ))}
        </View>
        <View style={[styles.chipsRow, { marginBottom: 0 }]}>
          {PERIOD_CHIPS.map((c) => (
            <Chip key={c.labelKey} label={t(c.labelKey)} active={period === c.key} onPress={() => setPeriod(c.key)} />
          ))}
        </View>
      </Card>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.white} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />}
          ListEmptyComponent={<Text style={styles.emptyText}>{t('historique.empty')}</Text>}
          renderItem={({ item }) => {
            const credit = item.wallet_destination_id === walletId;
            return (
              <Pressable onPress={() => navigation.navigate('HistoriqueDetail', { transaction: item, walletId })}>
                <Card style={styles.row}>
                  <TxTypeIcon type={item.type} credit={credit} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.rowTitle} numberOfLines={1}>{txDisplayTitle(item, credit, t)}</Text>
                    <Text style={styles.rowSubtitle}>{txMethodLabel(item.méthode, t)}</Text>
                    <Text style={styles.rowDate}>{formatDate(item.date_heure)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.rowAmount, { color: credit ? colors.green : colors.white }]}>
                      {credit ? '+' : '-'}
                      {formatFcfa(item.montant)}
                    </Text>
                    <Text style={[styles.rowStatus, { color: statutColor(item.statut) }]}>{statutLabel(item.statut, t)}</Text>
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
  header: { paddingHorizontal: 20, paddingTop: 10 },
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  filtersCard: { marginHorizontal: 20, marginBottom: 12, padding: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
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

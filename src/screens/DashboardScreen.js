import React, { useCallback, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import Icon from '../components/Icon';
import StatusBadge from '../components/StatusBadge';
import TxTypeIcon from '../components/TxTypeIcon';
import { useAuth } from '../context/AuthContext';
import { getMyWallet, getMyHistory } from '../api/wallet';
import { getKycStatus } from '../api/kyc';
import { getBiometricStatus } from '../api/biometrie';
import { colors, kycStatusColor, kycStatusLabel, statutColor, txTypeLabel } from '../theme/colors';
import { formatFcfa, formatDate } from '../utils/format';
import { SERVER_ORIGIN } from '../config/api';

const QUICK_ACTIONS = [
  { key: 'Recharge', label: 'Recharger', color: colors.orange, icon: 'plus' },
  { key: 'Transfer', label: 'Transférer', color: colors.turquoise, icon: 'right-left' },
  { key: 'Payer', label: 'Payer', color: colors.magenta, icon: 'qrcode' },
  { key: 'Historique', label: 'Historique', color: colors.blue, icon: 'clock-rotate-left' },
];

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [enrolled, setEnrolled] = useState(null);
  const [recent, setRecent] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [balanceHidden, setBalanceHidden] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [w, k, b, hist] = await Promise.all([
        getMyWallet(),
        getKycStatus(),
        getBiometricStatus(),
        getMyHistory({ limit: 5 }),
      ]);
      setWallet(w);
      setKyc(k);
      setEnrolled(b.enrolled);
      setRecent(hist);
    } catch (e) {
      setError(e.message || 'Impossible de charger le tableau de bord.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const showKycBanner = kyc && kyc.statutKyc !== 'validé' && !enrolled;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.navigate('Paramètres')} style={styles.avatar}>
            {user?.photo_url ? (
              <Image source={{ uri: `${SERVER_ORIGIN}${user.photo_url}` }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{(user?.prenom?.[0] || '') + (user?.nom?.[0] || '')}</Text>
            )}
          </Pressable>
          <View style={styles.greetingTextWrap}>
            <Text style={styles.greeting}>Bonjour{user?.prenom ? `, ${user.prenom}` : ''}</Text>
            <Text style={styles.greetingSub}>Compte AfriPay</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Notifications')} style={styles.bell}>
            <Icon name="bell" size={18} color={colors.white} />
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeaderRow}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Pressable onPress={() => setBalanceHidden((v) => !v)} hitSlop={10}>
              <Icon name={balanceHidden ? 'eye-slash' : 'eye'} size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={styles.balanceValue}>
            {!wallet ? '—' : balanceHidden ? '•••••• FCFA' : formatFcfa(wallet.solde)}
          </Text>
          {kyc ? (
            <View style={{ marginTop: 12 }}>
              <StatusBadge
                label={kyc.statutKyc === 'validé' ? 'Compte vérifié · KYC validé' : `KYC ${kycStatusLabel(kyc.statutKyc).toLowerCase()}`}
                color={kycStatusColor(kyc.statutKyc)}
              />
            </View>
          ) : null}
        </Card>

        {showKycBanner ? (
          <Pressable onPress={() => navigation.navigate('KycHome')}>
            <Card style={styles.kycBanner}>
              <Text style={styles.kycBannerTitle}>Complétez votre KYC</Text>
              <Text style={styles.kycBannerText}>
                Vérifiez votre identité pour lever le plafond de recharge (10 000 FCFA) et activer le paiement
                par paume.
              </Text>
            </Card>
          </Pressable>
        ) : null}

        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <Pressable key={a.key} style={styles.actionTile} onPress={() => navigation.navigate(a.key)}>
              <View style={[styles.actionIcon, { backgroundColor: `${a.color}22`, borderColor: a.color }]}>
                <Icon name={a.icon} size={20} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transactions récentes</Text>
          <Pressable onPress={() => navigation.navigate('Historique')}>
            <Text style={styles.sectionLink}>Voir tout</Text>
          </Pressable>
        </View>

        {recent.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Aucune transaction pour le moment.</Text>
          </Card>
        ) : (
          recent.map((tx) => (
            <Card key={tx.id} style={styles.txRow}>
              <TxTypeIcon type={tx.type} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.txTitle}>{tx.libelle || txTypeLabel(tx.type)}</Text>
                <Text style={styles.txDate}>{formatDate(tx.date_heure)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.txAmount, { color: tx.type === 'recharge' ? colors.green : colors.white }]}>
                  {tx.type === 'recharge' ? '+' : '-'}
                  {formatFcfa(tx.montant)}
                </Text>
                <Text style={[styles.txStatus, { color: statutColor(tx.statut) }]}>{tx.statut}</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { color: colors.danger, marginBottom: 12 },
  greetingTextWrap: { flex: 1, marginHorizontal: 12 },
  greeting: { color: colors.white, fontSize: 18, fontWeight: '700' },
  greetingSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  balanceCard: { marginBottom: 16 },
  balanceHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLabel: { color: colors.textSecondary, fontSize: 13 },
  balanceValue: { color: colors.white, fontSize: 32, fontWeight: '800', marginTop: 6 },
  kycBanner: { marginBottom: 16, borderColor: colors.gold },
  kycBannerTitle: { color: colors.gold, fontWeight: '700', marginBottom: 4 },
  kycBannerText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  actionTile: { width: '23%', alignItems: 'center' },
  actionIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: { color: colors.white, fontSize: 11, textAlign: 'center' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: colors.white, fontWeight: '700', fontSize: 16 },
  sectionLink: { color: colors.blue, fontSize: 13 },
  emptyText: { color: colors.textSecondary },
  txRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  txTitle: { color: colors.white, fontWeight: '600' },
  txDate: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  txAmount: { color: colors.white, fontWeight: '700' },
  txStatus: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
});

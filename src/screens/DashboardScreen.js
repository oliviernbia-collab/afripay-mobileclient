import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Icon from '../components/Icon';
import BrandHeader from '../components/BrandHeader';
import StatusBadge from '../components/StatusBadge';
import TxTypeIcon from '../components/TxTypeIcon';
import SideMenu from '../components/SideMenu';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { getMyWallet, getMyHistory } from '../api/wallet';
import { getKycStatus } from '../api/kyc';
import { getBiometricStatus } from '../api/biometrie';
import { getCached, setCached } from '../utils/offlineCache';
import { colors, kycStatusColor, kycStatusLabel, statutColor, statutLabel, txDisplayTitle } from '../theme/colors';
import { formatFcfa, formatDate } from '../utils/format';

const WALLET_CACHE_KEY = 'wallet';

const QUICK_ACTIONS = [
  { key: 'Recharge', labelKey: 'dashboard.actions.recharge', color: colors.orange, icon: 'plus' },
  { key: 'Transfer', labelKey: 'dashboard.actions.transfer', color: colors.turquoise, icon: 'right-left' },
  { key: 'Payer', labelKey: 'dashboard.actions.pay', color: colors.magenta, icon: 'qrcode' },
  { key: 'Historique', labelKey: 'dashboard.actions.history', color: colors.blue, icon: 'clock-rotate-left' },
];

export default function DashboardScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [enrolled, setEnrolled] = useState(null);
  const [recent, setRecent] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  // Support hors-ligne partiel (cahier des charges 9.4) : dernier solde connu affiché
  // immédiatement depuis le cache local le temps que le réseau réponde, et conservé (avec son
  // horodatage) si l'appel échoue faute de connexion plutôt que de retomber sur "—".
  const [walletCachedAt, setWalletCachedAt] = useState(null);
  const [offline, setOffline] = useState(false);

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
      setOffline(false);
      setWalletCachedAt(null);
      setCached(WALLET_CACHE_KEY, w);
    } catch (e) {
      const cached = await getCached(WALLET_CACHE_KEY);
      if (cached) {
        // Hors-ligne (ou serveur injoignable) mais un solde connu existe : on le montre plutôt
        // qu'une erreur bloquante — l'utilisateur sait au moins où il en était.
        setWallet(cached.value);
        setWalletCachedAt(cached.cachedAt);
        setOffline(true);
      } else {
        setError(e.message || t('dashboard.loadError'));
      }
    }
  }, [t]);

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
  const firstName = user?.prenom?.trim().split(/\s+/)[0] || '';

  const confirmLogout = () => {
    Alert.alert(t('sideMenu.logoutConfirmTitle'), t('sideMenu.logoutConfirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('sideMenu.logout'), style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />}
      >
        {/* Section 10.3 du cahier des charges : le logo doit apparaître dans l'en-tête du
            tableau de bord (déjà présent sur le splash screen et la page de connexion). */}
        <View style={styles.brandRow}>
          <BrandHeader size="icon" showTagline={false} />
        </View>

        <View style={styles.header}>
          <Pressable onPress={() => setMenuVisible(true)} style={styles.menuTrigger} hitSlop={8}>
            <Icon name="bars" size={15} color={colors.white} />
          </Pressable>
          <View style={styles.greetingTextWrap}>
            <Text style={styles.greeting}>
              {t('dashboard.greeting')}
              {firstName ? `, ${firstName}` : ''}
            </Text>
            <Text style={styles.greetingSub}>{t('dashboard.subtitle')}</Text>
          </View>
          <LanguageSwitcher />
          <Pressable onPress={() => navigation.navigate('Notifications')} style={styles.bell}>
            <Icon name="bell" size={18} color={colors.white} />
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeaderRow}>
            <Text style={styles.balanceLabel}>{t('dashboard.balanceLabel')}</Text>
            <Pressable onPress={() => setBalanceHidden((v) => !v)} hitSlop={10}>
              <Icon name={balanceHidden ? 'eye-slash' : 'eye'} size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={styles.balanceValue}>
            {!wallet ? '—' : balanceHidden ? '•••••• FCFA' : formatFcfa(wallet.solde)}
          </Text>
          {offline && walletCachedAt ? (
            <View style={styles.offlineRow}>
              <Icon name="wifi" size={11} color={colors.gold} />
              <Text style={styles.offlineText}>
                {t('dashboard.offlineBalance', { time: formatDate(new Date(walletCachedAt).toISOString()) })}
              </Text>
            </View>
          ) : null}
          {kyc ? (
            <View style={{ marginTop: 12 }}>
              <StatusBadge
                label={
                  kyc.statutKyc === 'validé'
                    ? t('dashboard.kycVerified')
                    : t('dashboard.kycStatusPrefix', { status: kycStatusLabel(kyc.statutKyc, t).toLowerCase() })
                }
                color={kycStatusColor(kyc.statutKyc)}
              />
            </View>
          ) : null}
        </Card>

        {showKycBanner ? (
          <Pressable onPress={() => navigation.navigate('KycHome')}>
            <Card style={styles.kycBanner}>
              <Text style={styles.kycBannerTitle}>{t('dashboard.completeKycTitle')}</Text>
              <Text style={styles.kycBannerText}>{t('dashboard.completeKycText')}</Text>
            </Card>
          </Pressable>
        ) : null}

        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <Pressable key={a.key} style={styles.actionTile} onPress={() => navigation.navigate(a.key)}>
              <View style={[styles.actionIcon, { backgroundColor: `${a.color}22`, borderColor: a.color }]}>
                <Icon name={a.icon} size={20} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{t(a.labelKey)}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('dashboard.transactionsRecent')}</Text>
          <Pressable onPress={() => navigation.navigate('Historique')}>
            <Text style={styles.sectionLink}>{t('common.seeAll')}</Text>
          </Pressable>
        </View>

        {recent.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>{t('dashboard.noTransactions')}</Text>
          </Card>
        ) : (
          recent.map((tx) => {
            const credit = tx.wallet_destination_id === wallet?.id;
            return (
              <Card key={tx.id} style={styles.txRow}>
                <TxTypeIcon type={tx.type} credit={credit} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.txTitle} numberOfLines={1}>{txDisplayTitle(tx, credit, t)}</Text>
                  <Text style={styles.txDate}>{formatDate(tx.date_heure)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.txAmount, { color: credit ? colors.green : colors.white }]}>
                    {credit ? '+' : '-'}
                    {formatFcfa(tx.montant)}
                  </Text>
                  <Text style={[styles.txStatus, { color: statutColor(tx.statut) }]}>{statutLabel(tx.statut, t)}</Text>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        user={user}
        navigation={navigation}
        onLogout={confirmLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  brandRow: { alignItems: 'center', marginTop: 4, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
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
  greetingTextWrap: { flex: 1 },
  greeting: { color: colors.white, fontSize: 18, fontWeight: '700' },
  greetingSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  menuTrigger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: { marginBottom: 16 },
  balanceHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLabel: { color: colors.textSecondary, fontSize: 13 },
  balanceValue: { color: colors.white, fontSize: 32, fontWeight: '800', marginTop: 6 },
  offlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  offlineText: { color: colors.gold, fontSize: 11.5, fontWeight: '600' },
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

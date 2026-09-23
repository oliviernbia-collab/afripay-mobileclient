import React from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Icon from '../components/Icon';
import StatusBadge from '../components/StatusBadge';
import { colors, statutColor, statutLabel, txTypeLabel, txMethodLabel } from '../theme/colors';
import { formatFcfa, formatDate } from '../utils/format';

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function HistoriqueDetailScreen({ route }) {
  const { t } = useTranslation();
  const { transaction, walletId } = route.params;
  const isFailed = transaction.statut === 'échoué';
  const isCredit = walletId ? transaction.wallet_destination_id === walletId : transaction.type === 'recharge';

  const TX_TITLES = {
    recharge: t('historiqueDetail.titleRechargeSuccess'),
    achat: t('historiqueDetail.titlePurchaseSuccess'),
    transfert: t(isCredit ? 'historiqueDetail.titleTransferReceived' : 'historiqueDetail.titleTransferSent'),
  };

  const title = isFailed
    ? `${txTypeLabel(transaction.type, t)} ${t('historiqueDetail.titleFailedSuffix')}`
    : transaction.statut === 'en_attente'
    ? `${txTypeLabel(transaction.type, t)} ${t('historiqueDetail.titlePendingSuffix')}`
    : TX_TITLES[transaction.type] || TX_TITLES.recharge;

  const onShare = () => {
    Share.share({
      message: t('historiqueDetail.shareMessage', {
        title,
        amount: formatFcfa(transaction.montant),
        reference: transaction.reference || '—',
        date: formatDate(transaction.date_heure),
      }),
    });
  };

  return (
    <ScreenContainer>
      <Card style={styles.amountCard}>
        <Icon
          name={isFailed ? 'circle-xmark' : 'circle-check'}
          size={48}
          color={isFailed ? colors.danger : colors.success}
        />
        <Text style={[styles.receiptTitle, { color: isFailed ? colors.danger : colors.success }]}>{title}</Text>
        <Text style={[styles.amountValue, { color: isFailed ? colors.white : isCredit ? colors.green : colors.white }]}>
          {!isFailed && isCredit ? '+' : ''}
          {formatFcfa(transaction.montant)}
        </Text>
        <View style={{ marginTop: 10 }}>
          <StatusBadge label={statutLabel(transaction.statut, t)} color={statutColor(transaction.statut)} />
        </View>
      </Card>

      <Card>
        <Row label={t('historiqueDetail.typeLabel')} value={txTypeLabel(transaction.type, t)} />
        <Row label={t('historiqueDetail.methodLabel')} value={txMethodLabel(transaction.méthode, t)} />
        {transaction.contrepartie?.nom ? (
          <Row label={t('historiqueDetail.counterpartyLabel')} value={transaction.contrepartie.nom} />
        ) : null}
        {transaction.contrepartie?.telephone ? (
          <Row label={t('historiqueDetail.numberLabel')} value={transaction.contrepartie.telephone} />
        ) : null}
        <Row label={t('historiqueDetail.referenceLabel')} value={transaction.reference || '—'} />
        <Row label={t('historiqueDetail.dateLabel')} value={formatDate(transaction.date_heure)} />
        {transaction.frais ? <Row label={t('historiqueDetail.feesLabel')} value={formatFcfa(transaction.frais)} /> : null}
        {transaction.libelle ? <Row label={t('historiqueDetail.noteLabel')} value={transaction.libelle} /> : null}
      </Card>

      <Pressable onPress={onShare} style={styles.shareBtn}>
        <Icon name="share-nodes" size={15} color={colors.blue} />
        <Text style={styles.shareText}>{t('historiqueDetail.share')}</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  amountCard: { alignItems: 'center', marginBottom: 16, marginTop: 10, paddingVertical: 24 },
  receiptTitle: { fontSize: 17, fontWeight: '700', marginTop: 12 },
  amountValue: { color: colors.white, fontSize: 28, fontWeight: '800', marginTop: 8 },
  shareBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareText: { color: colors.blue, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.textSecondary, fontSize: 13 },
  rowValue: { color: colors.white, fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
});

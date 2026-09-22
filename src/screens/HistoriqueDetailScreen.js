import React from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Icon from '../components/Icon';
import StatusBadge from '../components/StatusBadge';
import { colors, statutColor, txTypeLabel, txMethodLabel } from '../theme/colors';
import { formatFcfa, formatDate } from '../utils/format';

const TX_TITLES = {
  recharge: 'Rechargement réussi',
  achat: 'Paiement effectué',
  transfert: 'Transfert envoyé',
};

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function HistoriqueDetailScreen({ route }) {
  const { transaction } = route.params;
  const isFailed = transaction.statut === 'échoué';
  const isCredit = transaction.type === 'recharge';
  const title = isFailed
    ? `${txTypeLabel(transaction.type)} échoué`
    : transaction.statut === 'en_attente'
    ? `${txTypeLabel(transaction.type)} en attente`
    : TX_TITLES[transaction.type] || `${txTypeLabel(transaction.type)} réussi`;

  const onShare = () => {
    Share.share({
      message: `AfriPay — ${title}\nMontant : ${formatFcfa(transaction.montant)}\nRéférence : ${
        transaction.reference || '—'
      }\nDate : ${formatDate(transaction.date_heure)}`,
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
          <StatusBadge label={transaction.statut} color={statutColor(transaction.statut)} />
        </View>
      </Card>

      <Card>
        <Row label="Type" value={txTypeLabel(transaction.type)} />
        <Row label="Méthode" value={txMethodLabel(transaction.méthode)} />
        <Row label="Référence" value={transaction.reference || '—'} />
        <Row label="Date" value={formatDate(transaction.date_heure)} />
        {transaction.frais ? <Row label="Frais" value={formatFcfa(transaction.frais)} /> : null}
        {transaction.libelle ? <Row label="Note" value={transaction.libelle} /> : null}
      </Card>

      <Pressable onPress={onShare} style={styles.shareBtn}>
        <Icon name="share-nodes" size={15} color={colors.blue} />
        <Text style={styles.shareText}>Partager le reçu</Text>
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

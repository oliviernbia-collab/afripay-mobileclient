import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { colors, statutColor, txTypeLabel, txMethodLabel } from '../theme/colors';
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
  const { transaction } = route.params;

  return (
    <ScreenContainer>
      <Text style={styles.title}>Reçu de transaction</Text>

      <Card style={styles.amountCard}>
        <Text style={styles.amountLabel}>Montant</Text>
        <Text style={styles.amountValue}>{formatFcfa(transaction.montant)}</Text>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginBottom: 18, marginTop: 10 },
  amountCard: { alignItems: 'center', marginBottom: 16, paddingVertical: 24 },
  amountLabel: { color: colors.textSecondary, fontSize: 13 },
  amountValue: { color: colors.white, fontSize: 28, fontWeight: '800', marginTop: 6 },
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

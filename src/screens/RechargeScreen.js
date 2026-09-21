import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/Input';
import GradientButton from '../components/GradientButton';
import ErrorBanner from '../components/ErrorBanner';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { getProviders, recharge } from '../api/recharges';
import { colors, providerBrand, radius } from '../theme/colors';
import { formatFcfa } from '../utils/format';
import { ApiError } from '../api/client';

export default function RechargeScreen({ navigation }) {
  const [providers, setProviders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [montant, setMontant] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [capError, setCapError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    getProviders()
      .then(setProviders)
      .catch(() => setProviders(['wave', 'orange_money', 'moov_money', 'mtn_money', 'djamo', 'visa']));
  }, []);

  const onSubmit = async () => {
    setError('');
    setCapError(null);
    setSuccess(null);
    if (!selected) {
      setError('Choisissez un moyen de recharge.');
      return;
    }
    const amount = Number(montant);
    if (!amount || amount <= 0) {
      setError('Saisissez un montant valide.');
      return;
    }
    setLoading(true);
    try {
      const result = await recharge(selected, amount);
      setSuccess(result);
      setMontant('');
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setCapError(e.message);
      } else {
        setError(e.message || 'Recharge impossible.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Recharger mon compte</Text>
        <ErrorBanner message={error} />

        {capError ? (
          <Card style={styles.capCard}>
            <Text style={styles.capTitle}>Plafond de recharge atteint</Text>
            <Text style={styles.capText}>{capError}</Text>
            <Text style={styles.capText}>
              Tant que votre KYC n&apos;est pas validé, les recharges cumulées sont limitées à 10 000 FCFA. Complétez
              votre KYC pour lever ce plafond.
            </Text>
            <Pressable onPress={() => navigation.navigate('KycHome')} style={styles.capLinkRow}>
              <Text style={styles.capLink}>Compléter mon KYC</Text>
              <Icon name="arrow-right" size={12} color={colors.blue} />
            </Pressable>
          </Card>
        ) : null}

        {success ? (
          <Card style={styles.successCard}>
            <Text style={styles.successTitle}>Recharge réussie</Text>
            <Text style={styles.successText}>
              {formatFcfa(success.transaction.montant)} ajoutés via {providerBrand[selected]?.label || selected}.
            </Text>
            <Text style={styles.successText}>Nouveau solde : {formatFcfa(success.wallet.solde)}</Text>
          </Card>
        ) : null}

        <Text style={styles.sectionLabel}>Choisissez un moyen de paiement</Text>
        <View style={styles.grid}>
          {providers.map((p) => {
            const brand = providerBrand[p] || { label: p, color: colors.turquoise };
            const isSelected = selected === p;
            return (
              <Pressable
                key={p}
                onPress={() => setSelected(p)}
                style={[
                  styles.tile,
                  { borderColor: isSelected ? brand.color : colors.border },
                  isSelected && { backgroundColor: `${brand.color}22` },
                ]}
              >
                <View style={[styles.tileDot, { backgroundColor: brand.color }]} />
                <Text style={styles.tileLabel}>{brand.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          label="Montant (FCFA)"
          placeholder="Ex: 5000"
          keyboardType="number-pad"
          value={montant}
          onChangeText={setMontant}
          style={{ marginTop: 8 }}
        />

        <GradientButton title="Recharger" onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginBottom: 18 },
  sectionLabel: { color: colors.textSecondary, marginBottom: 10, fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  tile: {
    width: '48%',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tileDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  tileLabel: { color: colors.white, fontWeight: '600', fontSize: 13 },
  capCard: { borderColor: colors.red, marginBottom: 16 },
  capTitle: { color: colors.red, fontWeight: '700', marginBottom: 6 },
  capText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 4 },
  capLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  capLink: { color: colors.blue, fontWeight: '600' },
  successCard: { borderColor: colors.success, marginBottom: 16 },
  successTitle: { color: colors.success, fontWeight: '700', marginBottom: 6 },
  successText: { color: colors.white, fontSize: 13, marginBottom: 2 },
});

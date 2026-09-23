import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/Input';
import GradientButton from '../components/GradientButton';
import ErrorBanner from '../components/ErrorBanner';
import Card from '../components/Card';
import Icon from '../components/Icon';
import IconRow from '../components/IconRow';
import {
  getProviders,
  recharge,
  getMyPaymentMethods,
  addPaymentMethod,
} from '../api/recharges';
import { colors, providerBrand, providerLabel } from '../theme/colors';
import { formatFcfa } from '../utils/format';
import { ApiError } from '../api/client';

function maskMethod(fournisseur, identifiant) {
  return fournisseur === 'visa' ? `•••• ${identifiant}` : identifiant;
}

export default function RechargeScreen({ navigation }) {
  const { t } = useTranslation();
  const [providers, setProviders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [montant, setMontant] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [capError, setCapError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [methods, setMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIdentifiant, setNewIdentifiant] = useState('');
  const [savingMethod, setSavingMethod] = useState(false);
  const [methodError, setMethodError] = useState('');

  useEffect(() => {
    getProviders()
      .then(setProviders)
      .catch(() => setProviders(['wave', 'orange_money', 'moov_money', 'mtn_money', 'djamo', 'visa']));
  }, []);

  const loadMethods = useCallback(
    async (fournisseur) => {
      setLoadingMethods(true);
      setMethodError('');
      try {
        const data = await getMyPaymentMethods(fournisseur);
        setMethods(data);
        setSelectedMethodId(data[0]?.id || null);
        setShowAddForm(data.length === 0);
      } catch (e) {
        setMethodError(e.message || t('recharge.errors.methodsLoadError'));
      } finally {
        setLoadingMethods(false);
      }
    },
    [t]
  );

  const onSelectProvider = (p) => {
    setSelected(p);
    setSuccess(null);
    setNewIdentifiant('');
    loadMethods(p);
  };

  const onSaveMethod = async () => {
    setMethodError('');
    const isVisa = selected === 'visa';
    if (isVisa && !/^\d{4}$/.test(newIdentifiant.trim())) {
      setMethodError(t('recharge.errors.last4Required'));
      return;
    }
    if (!isVisa && !newIdentifiant.trim()) {
      setMethodError(t('recharge.errors.numberRequired'));
      return;
    }
    setSavingMethod(true);
    try {
      const created = await addPaymentMethod({ fournisseur: selected, identifiant: newIdentifiant.trim() });
      setMethods((prev) => [created, ...prev]);
      setSelectedMethodId(created.id);
      setShowAddForm(false);
      setNewIdentifiant('');
    } catch (e) {
      setMethodError(e.message || t('recharge.errors.methodSaveError'));
    } finally {
      setSavingMethod(false);
    }
  };

  const onSubmit = async () => {
    setError('');
    setCapError(null);
    setSuccess(null);
    if (!selected) {
      setError(t('recharge.errors.chooseMethodRequired'));
      return;
    }
    if (!selectedMethodId) {
      setError(t('recharge.errors.registerFirst', { provider: providerLabel(selected, t) }));
      return;
    }
    const amount = Number(montant);
    if (!amount || amount <= 0) {
      setError(t('recharge.errors.invalidAmount'));
      return;
    }
    setLoading(true);
    try {
      const result = await recharge(selected, amount, selectedMethodId);
      setSuccess(result);
      setMontant('');
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setCapError(e.message);
      } else {
        setError(e.message || t('recharge.errors.genericError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const isVisa = selected === 'visa';

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('recharge.title')}</Text>
      <ErrorBanner message={error} />

      {capError ? (
        <Card style={styles.capCard}>
          <Text style={styles.capTitle}>{t('recharge.capTitle')}</Text>
          <Text style={styles.capText}>{capError}</Text>
          <Text style={styles.capText}>{t('recharge.capText')}</Text>
          <Pressable onPress={() => navigation.navigate('KycHome')} style={styles.capLinkRow}>
            <Text style={styles.capLink}>{t('recharge.completeKyc')}</Text>
            <Icon name="arrow-right" size={12} color={colors.blue} />
          </Pressable>
        </Card>
      ) : null}

      {success ? (
        <Card style={styles.successCard}>
          <Text style={styles.successTitle}>{t('recharge.successTitle')}</Text>
          <Text style={styles.successText}>
            {t('recharge.successAdded', {
              amount: formatFcfa(success.transaction.montant),
              provider: providerLabel(selected, t),
            })}
          </Text>
          <Text style={styles.successText}>
            {t('recharge.successNewBalance', { balance: formatFcfa(success.wallet.solde) })}
          </Text>
        </Card>
      ) : null}

      <Text style={styles.sectionLabel}>{t('recharge.chooseMethod')}</Text>
      {providers.map((p) => {
        const brand = providerBrand[p] || { color: colors.turquoise, icon: 'wallet' };
        return (
          <IconRow
            key={p}
            icon={brand.icon}
            iconColor={brand.color}
            label={providerLabel(p, t)}
            selected={selected === p}
            onPress={() => onSelectProvider(p)}
            showChevron={false}
            right={selected === p ? <Icon name="circle-check" size={18} color={brand.color} /> : null}
          />
        );
      })}

      {selected ? (
        <View style={styles.methodSection}>
          <Text style={styles.sectionLabel}>{t('recharge.yourAccount', { provider: providerLabel(selected, t) })}</Text>

          {methodError ? <ErrorBanner message={methodError} /> : null}

          {loadingMethods ? (
            <ActivityIndicator color={colors.white} style={{ marginVertical: 10 }} />
          ) : (
            <>
              {methods.map((m) => (
                <IconRow
                  key={m.id}
                  icon={isVisa ? 'credit-card' : 'mobile-screen'}
                  iconColor={providerBrand[selected]?.color || colors.turquoise}
                  label={maskMethod(m.fournisseur, m.identifiant)}
                  subtitle={m.libelle || undefined}
                  selected={selectedMethodId === m.id}
                  onPress={() => setSelectedMethodId(m.id)}
                  showChevron={false}
                  right={
                    selectedMethodId === m.id ? (
                      <Icon name="circle-check" size={18} color={providerBrand[selected]?.color || colors.turquoise} />
                    ) : null
                  }
                />
              ))}

              {!showAddForm ? (
                <Pressable onPress={() => setShowAddForm(true)} style={styles.addLink}>
                  <Icon name="plus" size={12} color={colors.blue} />
                  <Text style={styles.addLinkText}>
                    {isVisa ? t('recharge.addAnotherCard') : t('recharge.addAnotherNumber')}
                  </Text>
                </Pressable>
              ) : (
                <Card style={styles.addCard}>
                  <Input
                    label={isVisa ? t('recharge.cardLast4Label') : t('recharge.phoneNumberLabel', { provider: providerLabel(selected, t) })}
                    placeholder={isVisa ? t('recharge.cardPlaceholder') : t('recharge.phonePlaceholder')}
                    keyboardType={isVisa ? 'number-pad' : 'phone-pad'}
                    maxLength={isVisa ? 4 : undefined}
                    value={newIdentifiant}
                    onChangeText={setNewIdentifiant}
                  />
                  <View style={styles.addCardActions}>
                    <GradientButton
                      title={t('common.save')}
                      onPress={onSaveMethod}
                      loading={savingMethod}
                      style={{ flex: 1 }}
                    />
                    {methods.length > 0 ? (
                      <Pressable onPress={() => setShowAddForm(false)} style={styles.cancelAddBtn}>
                        <Text style={styles.cancelAddText}>{t('common.cancel')}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </Card>
              )}
            </>
          )}
        </View>
      ) : null}

      <Input
        label={t('recharge.amountLabel')}
        placeholder={t('recharge.amountPlaceholder')}
        keyboardType="number-pad"
        value={montant}
        onChangeText={setMontant}
        style={{ marginTop: 8 }}
      />

      <GradientButton title={t('recharge.submit')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginBottom: 18 },
  sectionLabel: { color: colors.textSecondary, marginBottom: 10, fontSize: 13, fontWeight: '600' },
  capCard: { borderColor: colors.red, marginBottom: 16 },
  capTitle: { color: colors.red, fontWeight: '700', marginBottom: 6 },
  capText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 4 },
  capLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  capLink: { color: colors.blue, fontWeight: '600' },
  successCard: { borderColor: colors.success, marginBottom: 16 },
  successTitle: { color: colors.success, fontWeight: '700', marginBottom: 6 },
  successText: { color: colors.white, fontSize: 13, marginBottom: 2 },
  methodSection: { marginTop: 16, marginBottom: 8 },
  addLink: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  addLinkText: { color: colors.blue, fontWeight: '600', fontSize: 13 },
  addCard: { marginTop: 4 },
  addCardActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  cancelAddBtn: { paddingVertical: 14, paddingHorizontal: 4 },
  cancelAddText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
});

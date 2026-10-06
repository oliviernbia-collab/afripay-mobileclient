import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Linking } from 'react-native';
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
  getFraisRecharge,
  recharge,
  getMyPaymentMethods,
  addPaymentMethod,
} from '../api/recharges';
import { colors, providerBrand, providerLabel } from '../theme/colors';
import { formatFcfa } from '../utils/format';
import { ApiError } from '../api/client';

// Djamo est une carte prépayée, comme Visa — pas un wallet Mobile Money identifié par un numéro
// de téléphone (wave/orange_money/moov_money/mtn_money) : même traitement pour les deux (saisie
// des 4 derniers chiffres, affichage masqué), voir aussi paymentMethodService.js côté backend.
const CARD_PROVIDERS = ['visa', 'djamo'];

function maskMethod(fournisseur, identifiant) {
  return CARD_PROVIDERS.includes(fournisseur) ? `•••• ${identifiant}` : identifiant;
}

export default function RechargeScreen({ navigation }) {
  const { t } = useTranslation();
  const [providers, setProviders] = useState([]);
  const [tauxFrais, setTauxFrais] = useState(null);
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
    // Taux affiché dans l'aperçu de frais ci-dessous — silencieux si indisponible (l'aperçu ne
    // s'affiche alors simplement pas, la recharge elle-même n'en dépend pas).
    getFraisRecharge()
      .then((data) => setTauxFrais(Number(data?.taux)))
      .catch(() => {});
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
    const isCard = CARD_PROVIDERS.includes(selected);
    if (isCard && !/^\d{4}$/.test(newIdentifiant.trim())) {
      setMethodError(t('recharge.errors.last4Required'));
      return;
    }
    if (!isCard && !newIdentifiant.trim()) {
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
      // Le paiement se termine sur une page Jèko hébergée (saisie du code Mobile Money pour
      // l'opérateur déjà choisi) — le wallet n'est crédité qu'une fois le paiement confirmé
      // (webhook), pas à cet instant. On ouvre donc cette page plutôt que d'afficher un nouveau solde.
      if (result.paymentUrl) {
        Linking.openURL(result.paymentUrl).catch(() => {
          setError(t('recharge.errors.openPaymentPageError'));
        });
      }
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

  const isCard = CARD_PROVIDERS.includes(selected);

  // Aperçu avant confirmation : le client paie `montantSaisi` (envoyé tel quel à Jèko), mais seul
  // montant - frais est crédité au wallet AfriPay (voir backend rechargeService.confirmerPayin) —
  // Number.isFinite(tauxFrais) évite d'afficher un aperçu tant que /recharges/frais n'a pas répondu.
  const montantSaisi = Number(montant);
  const previewActif = Number.isFinite(tauxFrais) && Number.isFinite(montantSaisi) && montantSaisi > 0;
  const fraisPreview = previewActif ? Math.round(montantSaisi * tauxFrais) : 0;
  const creditPreview = previewActif ? montantSaisi - fraisPreview : 0;

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
          <Text style={styles.successTitle}>{t('recharge.pendingTitle')}</Text>
          <Text style={styles.successText}>
            {t('recharge.pendingText', {
              amount: formatFcfa(success.transaction.montant),
              provider: providerLabel(selected, t),
            })}
          </Text>
          {success.paymentUrl ? (
            <Pressable onPress={() => Linking.openURL(success.paymentUrl)} style={styles.reopenLink}>
              <Icon name="arrow-up-right-from-square" size={12} color={colors.blue} />
              <Text style={styles.reopenLinkText}>{t('recharge.reopenPaymentPage')}</Text>
            </Pressable>
          ) : null}
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
            image={brand.logo}
            imageResizeMode={brand.imageResizeMode}
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
                  icon={isCard ? 'credit-card' : 'mobile-screen'}
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
                    {isCard ? t('recharge.addAnotherCard') : t('recharge.addAnotherNumber')}
                  </Text>
                </Pressable>
              ) : (
                <Card style={styles.addCard}>
                  <Input
                    label={isCard ? t('recharge.cardLast4Label') : t('recharge.phoneNumberLabel', { provider: providerLabel(selected, t) })}
                    placeholder={isCard ? t('recharge.cardPlaceholder') : t('recharge.phonePlaceholder')}
                    keyboardType={isCard ? 'number-pad' : 'phone-pad'}
                    maxLength={isCard ? 4 : undefined}
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

      {previewActif ? (
        <Card style={styles.feePreviewCard}>
          <View style={styles.feePreviewRow}>
            <Text style={styles.feePreviewLabel}>
              {t('recharge.feePreviewFees', { taux: `${Math.round(tauxFrais * 1000) / 10}%` })}
            </Text>
            <Text style={styles.feePreviewValue}>-{formatFcfa(fraisPreview)}</Text>
          </View>
          <View style={styles.feePreviewRow}>
            <Text style={styles.feePreviewLabelStrong}>{t('recharge.feePreviewCredited')}</Text>
            <Text style={styles.feePreviewValueStrong}>{formatFcfa(creditPreview)}</Text>
          </View>
        </Card>
      ) : null}

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
  reopenLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  reopenLinkText: { color: colors.blue, fontWeight: '600', fontSize: 13 },
  methodSection: { marginTop: 16, marginBottom: 8 },
  addLink: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  addLinkText: { color: colors.blue, fontWeight: '600', fontSize: 13 },
  addCard: { marginTop: 4 },
  addCardActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  cancelAddBtn: { paddingVertical: 14, paddingHorizontal: 4 },
  cancelAddText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
  feePreviewCard: { marginTop: 10, gap: 6 },
  feePreviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feePreviewLabel: { color: colors.textSecondary, fontSize: 13 },
  feePreviewValue: { color: colors.textSecondary, fontSize: 13 },
  feePreviewLabelStrong: { color: colors.white, fontSize: 14, fontWeight: '700' },
  feePreviewValueStrong: { color: colors.white, fontSize: 14, fontWeight: '700' },
});

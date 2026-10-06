import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/ScreenContainer';
import Input from '../components/Input';
import GradientButton from '../components/GradientButton';
import ErrorBanner from '../components/ErrorBanner';
import Card from '../components/Card';
import IconRow from '../components/IconRow';
import Icon from '../components/Icon';
import { transferInterne, transferExterne, getFraisRetrait, MOBILE_MONEY_OPERATORS } from '../api/transferts';
import { colors, radius, providerBrand, providerLabel } from '../theme/colors';
import { formatFcfa } from '../utils/format';

export default function TransferScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState('interne'); // 'interne' | 'externe'

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('transfer.title')}</Text>

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, mode === 'interne' && styles.tabActive]} onPress={() => setMode('interne')}>
          <Text style={[styles.tabText, mode === 'interne' && styles.tabTextActive]}>{t('transfer.tabInternal')}</Text>
        </Pressable>
        <Pressable style={[styles.tab, mode === 'externe' && styles.tabActive]} onPress={() => setMode('externe')}>
          <Text style={[styles.tabText, mode === 'externe' && styles.tabTextActive]}>{t('transfer.tabExternal')}</Text>
        </Pressable>
      </View>

      {mode === 'interne' ? <InternalTransferForm /> : <ExternalTransferForm />}
    </ScreenContainer>
  );
}

function InternalTransferForm() {
  const { t } = useTranslation();
  const [telephoneDestinataire, setTelephoneDestinataire] = useState('');
  const [montant, setMontant] = useState('');
  const [libelle, setLibelle] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const amount = Number(montant);

  const onSubmit = async () => {
    setError('');
    setSuccess(null);
    if (!telephoneDestinataire.trim()) {
      setError(t('transfer.errors.recipientRequired'));
      return;
    }
    if (!amount || amount <= 0) {
      setError(t('transfer.errors.invalidAmount'));
      return;
    }
    // Le code PIN AfriPay confirme désormais systématiquement tout transfert (le backend le
    // rejette sans lui, quel que soit le montant) — ce n'est plus conditionné à un seuil.
    if (!/^\d{4,6}$/.test(pin)) {
      setError(t('transfer.errors.pinRequired'));
      return;
    }
    setLoading(true);
    try {
      const result = await transferInterne({
        telephoneDestinataire: telephoneDestinataire.trim(),
        montant: amount,
        libelle: libelle.trim() || undefined,
        pin,
      });
      setSuccess(result.transaction);
      setMontant('');
      setLibelle('');
      setPin('');
    } catch (e) {
      setError(e.message || t('transfer.errors.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ErrorBanner message={error} />

      {success ? (
        <Card style={styles.successCard}>
          <Text style={styles.successTitle}>{t('transfer.successTitle')}</Text>
          <Text style={styles.successText}>
            {t('transfer.successText', { amount: formatFcfa(success.montant), reference: success.reference })}
          </Text>
        </Card>
      ) : null}

      <Card style={styles.formCard}>
        <Input
          label={t('transfer.recipientLabel')}
          placeholder={t('transfer.recipientPlaceholder')}
          keyboardType="phone-pad"
          value={telephoneDestinataire}
          onChangeText={setTelephoneDestinataire}
        />
        <Input
          label={t('transfer.amountLabel')}
          placeholder={t('transfer.amountPlaceholder')}
          keyboardType="number-pad"
          value={montant}
          onChangeText={setMontant}
        />
        <Input
          label={t('transfer.noteLabel')}
          placeholder={t('transfer.notePlaceholder')}
          value={libelle}
          onChangeText={setLibelle}
        />

        <Text style={styles.pinNote}>{t('transfer.pinNote')}</Text>
        <Input
          label={t('transfer.pinLabel')}
          placeholder="••••"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          value={pin}
          onChangeText={setPin}
        />

        <GradientButton title={t('transfer.submit')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
      </Card>
    </>
  );
}

// Retrait Client vers Mobile Money externe (payout Jèko, section 6.4) — même mécanique que le
// retrait Marchand : le wallet Client est débité tout de suite, la transaction reste `en_attente`
// jusqu'à la confirmation par webhook (voir backend/src/services/transferService.js).
function ExternalTransferForm() {
  const { t } = useTranslation();
  const [opérateur, setOpérateur] = useState(MOBILE_MONEY_OPERATORS[0]);
  const [numéro, setNuméro] = useState('');
  const [montant, setMontant] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [tauxFrais, setTauxFrais] = useState(null);

  useEffect(() => {
    // Silencieux si indisponible : l'aperçu ne s'affiche alors simplement pas, le retrait lui-même
    // n'en dépend pas (le frais réel, lui, est toujours calculé côté backend).
    getFraisRetrait()
      .then((data) => setTauxFrais(Number(data?.taux)))
      .catch(() => {});
  }, []);

  const amount = Number(montant);
  // Aperçu avant confirmation : le wallet est débité du plein montant (voir backend
  // transferService.externalTransfer), mais seul montant - frais part réellement vers le Mobile
  // Money du destinataire.
  const previewActif = Number.isFinite(tauxFrais) && amount > 0;
  const fraisPreview = previewActif ? Math.round(amount * tauxFrais) : 0;
  const reçuPreview = previewActif ? amount - fraisPreview : 0;

  const onSubmit = async () => {
    setError('');
    setSuccess(null);
    if (!numéro.trim()) {
      setError(t('transfer.errors.recipientRequired'));
      return;
    }
    if (!amount || amount <= 0) {
      setError(t('transfer.errors.invalidAmount'));
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError(t('transfer.errors.pinRequired'));
      return;
    }
    setLoading(true);
    try {
      const result = await transferExterne({
        opérateurDestination: opérateur,
        numéroDestinataire: numéro.trim(),
        montant: amount,
        pin,
      });
      setSuccess(result.transaction);
      setNuméro('');
      setMontant('');
      setPin('');
    } catch (e) {
      setError(e.message || t('transfer.errors.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ErrorBanner message={error} />

      {success ? (
        <Card style={styles.successCard}>
          <Text style={styles.successTitle}>{t('transfer.pendingExternalTitle')}</Text>
          <Text style={styles.successText}>
            {t('transfer.pendingExternal', { operator: providerLabel(opérateur, t) })}
          </Text>
        </Card>
      ) : null}

      <Card style={styles.formCard}>
        <Text style={styles.label}>{t('transfer.operatorLabel')}</Text>
        {MOBILE_MONEY_OPERATORS.map((op) => {
          const meta = providerBrand[op] || { color: colors.turquoise, icon: 'wallet' };
          return (
            <IconRow
              key={op}
              icon={meta.icon}
              iconColor={meta.color}
              image={meta.logo}
              imageResizeMode={meta.imageResizeMode}
              label={providerLabel(op, t)}
              selected={opérateur === op}
              onPress={() => setOpérateur(op)}
              showChevron={false}
              right={opérateur === op ? <Icon name="circle-check" size={18} color={meta.color} /> : null}
            />
          );
        })}

        <Input
          label={t('transfer.externalNumberLabel')}
          placeholder={t('transfer.recipientPlaceholder')}
          keyboardType="phone-pad"
          value={numéro}
          onChangeText={setNuméro}
        />
        <Input
          label={t('transfer.amountLabel')}
          placeholder={t('transfer.amountPlaceholder')}
          keyboardType="number-pad"
          value={montant}
          onChangeText={setMontant}
        />

        {previewActif ? (
          <View style={styles.feePreviewCard}>
            <View style={styles.feePreviewRow}>
              <Text style={styles.feePreviewLabel}>
                {t('transfer.feePreviewFees', { taux: `${Math.round(tauxFrais * 1000) / 10}%` })}
              </Text>
              <Text style={styles.feePreviewValue}>-{formatFcfa(fraisPreview)}</Text>
            </View>
            <View style={styles.feePreviewRow}>
              <Text style={styles.feePreviewLabelStrong}>
                {t('transfer.feePreviewReceived', { operator: providerLabel(opérateur, t) })}
              </Text>
              <Text style={styles.feePreviewValueStrong}>{formatFcfa(reçuPreview)}</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.pinNote}>{t('transfer.pinNote')}</Text>
        <Input
          label={t('transfer.pinLabel')}
          placeholder="••••"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          value={pin}
          onChangeText={setPin}
        />

        <GradientButton title={t('transfer.submit')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginBottom: 18 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: colors.magenta },
  tabText: { color: colors.textSecondary, fontSize: 12.5, fontWeight: '600' },
  tabTextActive: { color: colors.white },
  formCard: { borderRadius: radius.xl },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: '500' },
  pinNote: { color: colors.gold, fontSize: 12, marginBottom: 10, lineHeight: 17 },
  successCard: { borderColor: colors.success, marginBottom: 16 },
  successTitle: { color: colors.success, fontWeight: '700', marginBottom: 6 },
  successText: { color: colors.white, fontSize: 13 },
  feePreviewCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 6,
    marginBottom: 12,
  },
  feePreviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feePreviewLabel: { color: colors.textSecondary, fontSize: 13 },
  feePreviewValue: { color: colors.textSecondary, fontSize: 13 },
  feePreviewLabelStrong: { color: colors.white, fontSize: 14, fontWeight: '700' },
  feePreviewValueStrong: { color: colors.white, fontSize: 14, fontWeight: '700' },
});

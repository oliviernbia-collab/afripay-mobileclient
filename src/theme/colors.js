// AfriPay brand palette — see DESIGN_TOKENS.md at the repo root.
export const colors = {
  black: '#000000',
  bg: '#0B0B0F', // anthracite background
  card: '#15151C',
  border: '#2A2A33',
  white: '#FFFFFF',
  textSecondary: '#B9B9C2',

  magenta: '#E6007E',
  red: '#E30613',
  orange: '#F7941D',
  gold: '#FFC20E',
  green: '#39B54A',
  turquoise: '#00A99D',
  blue: '#27AAE1',
  violet: '#92278F',

  success: '#39B54A',
  warning: '#FFC20E',
  danger: '#E30613',
  info: '#27AAE1',
};

// Ordered brand gradient stops (subset used for buttons / small elements)
export const brandGradient = ['#E6007E', '#F7941D', '#FFC20E'];
export const brandGradientFull = ['#E6007E', '#F7941D', '#FFC20E', '#39B54A', '#00A99D', '#27AAE1'];

export const radius = { sm: 8, md: 12, lg: 16, xl: 24 };

export const kycStatusColor = (statut) => {
  switch (statut) {
    case 'validé':
      return colors.success;
    case 'rejeté':
      return colors.danger;
    case 'suspendu':
      return colors.danger;
    case 'en_attente':
    default:
      return colors.warning;
  }
};

// Label helpers take the i18next `t` function so every backend enum value renders in the
// app's current language (see src/i18n) — callers get `t` from `useTranslation()`.
export const kycStatusLabel = (statut, t) => t(`status.kyc.${statut}`, { defaultValue: t('status.kyc.en_attente') });

export const statutLabel = (statut, t) => t(`status.tx.${statut}`, { defaultValue: statut || '—' });

export const providerBrand = {
  wave: { color: '#1DC8E3', icon: 'droplet' },
  orange_money: { color: '#F7941D', icon: 'mobile-screen' },
  moov_money: { color: '#27AAE1', icon: 'tower-cell' },
  mtn_money: { color: '#FFC20E', icon: 'sim-card' },
  djamo: { color: '#7C3AED', icon: 'wallet' },
  visa: { color: '#1A1F71', icon: 'credit-card' },
};

export const providerLabel = (key, t) => t(`providers.${key}`, { defaultValue: key });

export const txMethodLabel = (m, t) => t(`txMethod.${m}`, { defaultValue: m || '—' });

export const txTypeLabel = (type, t) => t(`txType.${type}`, { defaultValue: type || '—' });

// A transfert's own libelle (if any) always wins. Otherwise, since "Transfert" alone doesn't say
// whether money came in or went out, fall back to a direction-aware label using the counterparty's
// name/phone (attached server-side as `contrepartie`) when available.
export const txDisplayTitle = (tx, credit, t) => {
  if (tx.libelle) return tx.libelle;
  if (tx.type === 'transfert') {
    const name = tx.contrepartie?.nom || tx.contrepartie?.telephone;
    if (name) return t(credit ? 'historique.receivedFrom' : 'historique.sentTo', { name });
    return t(credit ? 'historique.transferReceived' : 'historique.transferSent');
  }
  return txTypeLabel(tx.type, t);
};

export const statutColor = (statut) => {
  switch (statut) {
    case 'réussi':
      return colors.success;
    case 'échoué':
      return colors.danger;
    case 'en_attente':
    default:
      return colors.warning;
  }
};

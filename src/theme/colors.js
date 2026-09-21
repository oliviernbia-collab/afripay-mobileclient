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

export const kycStatusLabel = (statut) => {
  switch (statut) {
    case 'validé':
      return 'Validé';
    case 'rejeté':
      return 'Rejeté';
    case 'suspendu':
      return 'Suspendu';
    case 'en_attente':
    default:
      return 'En attente';
  }
};

export const providerBrand = {
  wave: { label: 'Wave', color: '#1DC8E3' },
  orange_money: { label: 'Orange Money', color: '#F7941D' },
  moov_money: { label: 'Moov Money', color: '#27AAE1' },
  mtn_money: { label: 'MTN MoMo', color: '#FFC20E' },
  djamo: { label: 'Djamo', color: '#7C3AED' },
  visa: { label: 'Carte Visa', color: '#1A1F71' },
};

export const txMethodLabel = (m) => {
  switch (m) {
    case 'paume_de_main':
      return 'Paiement AfriPay (paume)';
    case 'mobile_money':
      return 'Mobile Money';
    case 'carte_visa':
      return 'Carte Visa';
    case 'interne':
      return 'Transfert AfriPay';
    default:
      return m || '—';
  }
};

export const txTypeLabel = (t) => {
  switch (t) {
    case 'achat':
      return 'Achat';
    case 'recharge':
      return 'Recharge';
    case 'transfert':
      return 'Transfert';
    default:
      return t || '—';
  }
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

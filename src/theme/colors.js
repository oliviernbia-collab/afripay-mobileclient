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

// `icon`/`color` restent le repli FontAwesome (utilisé si `logo` est absent) ; `logo` est le vrai
// logo de marque (icône d'app officielle récupérée depuis le Play Store de chaque fournisseur, ou
// le logo Visa officiel — voir assets/providers/) affiché à la place dans IconRow. `imageResizeMode`
// à 'contain' pour Visa : c'est un simple mot-symbole (wordmark) sans fond, pas une icône carrée
// comme les autres — 'cover' le découperait.
export const providerBrand = {
  wave: { color: '#1DC8E3', icon: 'droplet', logo: require('../../assets/providers/wave.png') },
  orange_money: { color: '#F7941D', icon: 'mobile-screen', logo: require('../../assets/providers/orange_money.png') },
  moov_money: { color: '#27AAE1', icon: 'tower-cell', logo: require('../../assets/providers/moov_money.png') },
  mtn_money: { color: '#FFC20E', icon: 'sim-card', logo: require('../../assets/providers/mtn_money.png') },
  djamo: { color: '#7C3AED', icon: 'wallet', logo: require('../../assets/providers/djamo.jpg') },
  visa: {
    color: '#1A1F71',
    icon: 'credit-card',
    logo: require('../../assets/providers/visa.png'),
    imageResizeMode: 'contain',
  },
};

export const providerLabel = (key, t) => t(`providers.${key}`, { defaultValue: key });

export const txMethodLabel = (m, t) => t(`txMethod.${m}`, { defaultValue: m || '—' });

export const txTypeLabel = (type, t) => t(`txType.${type}`, { defaultValue: type || '—' });

// Reconstruit le titre affiché ENTIÈREMENT côté client, dans la langue active à l'instant du
// rendu, à partir de champs structurés toujours frais (tx.type, tx.contrepartie — résolus à
// chaque lecture serveur, jamais figés) — jamais depuis `tx.libelle`, qui est un texte déjà
// traduit au moment de la création de la transaction et resterait donc coincé dans l'ancienne
// langue si l'utilisateur bascule ensuite (voir backend/src/services/transactionService.js).
// "Transfert" seul ne dit pas si l'argent est entré ou sorti, d'où la logique direction-aware pour
// les virements.
export const txDisplayTitle = (tx, credit, t) => {
  if (tx.type === 'transfert') {
    if (tx.contrepartie?.externe) {
      // Virement externe (Mobile Money) : pas de nom de personne, on compose "opérateur (numéro)".
      const provider = providerLabel(tx.contrepartie.fournisseur, t);
      const name = tx.contrepartie.telephone ? `${provider} (${tx.contrepartie.telephone})` : provider;
      return t(credit ? 'historique.receivedFrom' : 'historique.sentTo', { name });
    }
    const name = tx.contrepartie?.nom || tx.contrepartie?.telephone;
    if (name) return t(credit ? 'historique.receivedFrom' : 'historique.sentTo', { name });
    return t(credit ? 'historique.transferReceived' : 'historique.transferSent');
  }
  if (tx.type === 'achat' && tx.contrepartie?.nom) {
    return t('historique.purchaseAt', { name: tx.contrepartie.nom });
  }
  if (tx.type === 'recharge' && tx.contrepartie?.fournisseur) {
    return t('historique.rechargeVia', { provider: providerLabel(tx.contrepartie.fournisseur, t) });
  }
  return txTypeLabel(tx.type, t);
};

// Retraduit une notification dans la langue active à l'instant du rendu (voir txDisplayTitle
// ci-dessus pour le même principe côté transactions) : `titreCle`/`contenuCle`/`params` (voir
// backend/src/services/notificationService.js) permettent de reconstruire le texte à la volée
// plutôt que de faire confiance à `titre`/`contenu`, qui sont un rendu déjà figé dans la langue
// active à la CRÉATION de la notification. Repli sur `titre`/`contenu` bruts si aucune clé n'est
// fournie — notifications antérieures à cet ajout, ou messages diffusés librement par un admin
// (jamais gabarisés par nature).
export const notificationText = (item, t) => {
  // Champs bruts renvoyés par l'API en snake_case (comme wallet_destination_id, date_heure...),
  // jamais camelCasés — voir database/schema.sql / notificationService.js.
  const titreCle = item.titre_cle;
  const contenuCle = item.contenu_cle;
  if (!titreCle || !contenuCle) {
    return { titre: item.titre, contenu: item.contenu };
  }
  let params = item.params || {};
  if (typeof params === 'string') {
    try {
      params = JSON.parse(params);
    } catch {
      params = {};
    }
  }
  // `decision` (statut KYC brut, ex. 'rejeté') n'est jamais pré-traduit côté serveur — on le
  // retraduit ici avant interpolation, comme kycStatusLabel le fait déjà ailleurs dans l'app.
  const resolvedParams = params.decision ? { ...params, decision: kycStatusLabel(params.decision, t) } : params;
  return {
    titre: t(titreCle),
    contenu: t(contenuCle, resolvedParams).trim(),
  };
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

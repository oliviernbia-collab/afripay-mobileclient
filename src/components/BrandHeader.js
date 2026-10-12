import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, brandGradientFull } from '../theme/colors';

// Official AfriPay logo (see DESIGN_TOKENS.md §Logo). Resized copies live in
// assets/: logo-main.png (~480px wide, splash/login) and logo-compact.png
// (~160px wide, dashboard header / compact use).
const LOGO_MAIN = require('../../assets/logo-main.png');
const LOGO_COMPACT = require('../../assets/logo-compact.png');

/**
 * AfriPay brand block: official logo image + tagline. Used on the
 * splash/login screen (size="large") and the dashboard header
 * (size="compact").
 */
const SIZES = {
  large: { width: 220, height: 188 },
  compact: { width: 120, height: 102 },
  // Section 10.3 du cahier des charges : le logo doit aussi apparaître dans l'en-tête du tableau
  // de bord — trop petit pour "compact" (pensé pour un bloc de page pleine largeur, ex.
  // AboutScreen), ce format tient dans la ligne d'en-tête à côté du menu/de la cloche.
  icon: { width: 34, height: 29 },
};

// Épaisseur du liseré dégradé du cadre circulaire (prop `circle`).
const RING_WIDTH = 2.5;
// logo-main.png est le lockup complet (symbole + "AfriPay" + slogan) redimensionné tel
// quel, avec ses marges internes. Mesuré sur le fichier source : le point du dessin le
// plus excentré (la tiret du slogan) est à 1.044× la demi-largeur de l'image depuis son
// centre — 1.12 ajoute une marge de sécurité pour ne jamais rogner le texte.
const CIRCLE_RATIO = 1.12;

export default function BrandHeader({ size = 'large', showTagline = true, scale = 1, circle = false, style }) {
  const { t } = useTranslation();
  const { width: logoWidth, height: logoHeight } = SIZES[size] || SIZES.large;
  const source = size === 'large' ? LOGO_MAIN : LOGO_COMPACT;

  const logo = (
    <Image
      source={source}
      style={{ width: logoWidth * scale, height: logoHeight * scale }}
      resizeMode="contain"
      accessibilityLabel="AfriPay"
    />
  );

  return (
    <View style={[styles.container, style]}>
      {circle ? <BrandCircle diameter={logoWidth * scale * CIRCLE_RATIO}>{logo}</BrandCircle> : logo}
      {showTagline ? <Text style={styles.tagline}>{t('brand.tagline')}</Text> : null}
    </View>
  );
}

/** Pastille ronde : liseré dégradé de marque + disque sombre, logo centré. */
function BrandCircle({ diameter, children }) {
  const inner = diameter - RING_WIDTH * 2;
  return (
    <LinearGradient
      colors={brandGradientFull}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.ring, { width: diameter, height: diameter, borderRadius: diameter / 2 }]}
    >
      <View style={[styles.ringInner, { width: inner, height: inner, borderRadius: inner / 2 }]}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  tagline: { color: colors.textSecondary, marginTop: 6, fontSize: 13, letterSpacing: 0.3 },
  ring: { alignItems: 'center', justifyContent: 'center', padding: RING_WIDTH },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
});

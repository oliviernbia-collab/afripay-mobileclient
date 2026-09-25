import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

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

export default function BrandHeader({ size = 'large', showTagline = true, style }) {
  const { t } = useTranslation();
  const { width: logoWidth, height: logoHeight } = SIZES[size] || SIZES.large;
  const source = size === 'large' ? LOGO_MAIN : LOGO_COMPACT;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={{ width: logoWidth, height: logoHeight }}
        resizeMode="contain"
        accessibilityLabel="AfriPay"
      />
      {showTagline ? <Text style={styles.tagline}>{t('brand.tagline')}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  tagline: { color: colors.textSecondary, marginTop: 6, fontSize: 13, letterSpacing: 0.3 },
});

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
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
export default function BrandHeader({ size = 'large', showTagline = true, style }) {
  const isLarge = size === 'large';
  const logoWidth = isLarge ? 220 : 120;
  const logoHeight = isLarge ? 188 : 102; // matches source aspect ratio (~1.17:1)

  return (
    <View style={[styles.container, style]}>
      <Image
        source={isLarge ? LOGO_MAIN : LOGO_COMPACT}
        style={{ width: logoWidth, height: logoHeight }}
        resizeMode="contain"
        accessibilityLabel="AfriPay"
      />
      {showTagline ? <Text style={styles.tagline}>Créer. Partager. Gagner.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  tagline: { color: colors.textSecondary, marginTop: 6, fontSize: 13, letterSpacing: 0.3 },
});

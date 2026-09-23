import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme/colors';

/**
 * Small colored round icon avatar for a transaction/notification type —
 * matches the icon-avatar rows used in Historique/Dashboard/Notifications
 * in the mockup. `credit` (money coming into the wallet vs going out) drives
 * the arrow direction/color for recharge/achat/transfert alike, so a
 * transfert reçu and a transfert envoyé are visually distinguishable.
 */
export default function TxTypeIcon({ type, credit, size = 36 }) {
  let icon = 'money-bill-wave';
  let color = colors.turquoise;
  if (type === 'recharge' || type === 'achat' || type === 'transfert') {
    icon = credit ? 'arrow-up' : 'arrow-down';
    color = credit ? colors.green : colors.red;
  }
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}22` },
      ]}
    >
      <Icon name={icon} size={size * 0.42} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});

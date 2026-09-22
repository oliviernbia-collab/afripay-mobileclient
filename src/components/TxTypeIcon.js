import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme/colors';

const TYPE_STYLE = {
  recharge: { icon: 'arrow-up', color: colors.green },
  achat: { icon: 'arrow-down', color: colors.red },
  transfert: { icon: 'right-left', color: colors.blue },
};

/**
 * Small colored round icon avatar for a transaction/notification type —
 * matches the icon-avatar rows used in Historique/Dashboard/Notifications
 * in the mockup.
 */
export default function TxTypeIcon({ type, size = 36 }) {
  const { icon, color } = TYPE_STYLE[type] || { icon: 'money-bill-wave', color: colors.turquoise };
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

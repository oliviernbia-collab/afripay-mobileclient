import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from './Icon';
import { colors, radius } from '../theme/colors';

/**
 * List row used throughout the mockup for operator lists, settings menus and
 * step lists: a colored icon badge, a label (+ optional subtitle), and a
 * trailing chevron or custom value/accessory on the right.
 */
export default function IconRow({
  icon,
  iconColor = colors.turquoise,
  label,
  subtitle,
  selected,
  onPress,
  right,
  showChevron = true,
  style,
}) {
  return (
    <Pressable onPress={onPress} style={[styles.row, selected && { borderColor: iconColor, backgroundColor: `${iconColor}14` }, style]}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}22` }]}>
        <Icon name={icon} size={16} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? right : showChevron ? <Icon name="chevron-right" size={14} color={colors.textSecondary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: { color: colors.white, fontWeight: '600', fontSize: 14 },
  subtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
});

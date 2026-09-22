import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

/**
 * Row of filled/empty dots showing PIN entry progress — matches the
 * mockup's "Définissez votre code PIN" screen. Shows at least 4 slots
 * (the common PIN length) and grows if the user types a longer PIN
 * (up to 6 digits are supported).
 */
export default function PinDots({ length, minSlots = 4 }) {
  const slots = Math.max(minSlots, length);
  return (
    <View style={styles.row}>
      {Array.from({ length: slots }).map((_, i) => (
        <View key={i} style={[styles.dot, i < length && styles.dotFilled]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginVertical: 28 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  dotFilled: { backgroundColor: colors.magenta, borderColor: colors.magenta },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius } from '../theme/colors';

export default function StatusBadge({ label, color }) {
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}22` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  text: { fontSize: 12, fontWeight: '700' },
});

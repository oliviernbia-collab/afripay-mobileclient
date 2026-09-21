import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: `${colors.danger}22`,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
  },
  text: { color: colors.white, fontSize: 13 },
});

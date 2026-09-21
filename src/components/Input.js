import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

export default function Input({ label, error, style, ...props }) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, error && styles.inputError]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { color: colors.textSecondary, marginBottom: 6, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.white,
    fontSize: 16,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
});

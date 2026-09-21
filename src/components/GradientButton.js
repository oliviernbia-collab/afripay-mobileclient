import React from 'react';
import { Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, brandGradient } from '../theme/colors';

export default function GradientButton({ title, onPress, loading, disabled, style, variant = 'gradient' }) {
  const isDisabled = disabled || loading;
  const content = (
    <>
      {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.text}>{title}</Text>}
    </>
  );

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.button, styles.outline, isDisabled && styles.disabled, style]}
      >
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.outlineText}>{title}</Text>}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={isDisabled} style={[isDisabled && styles.disabled, style]}>
      <LinearGradient
        colors={brandGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        {content}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  text: { color: colors.white, fontWeight: '700', fontSize: 16 },
  outlineText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.5 },
});

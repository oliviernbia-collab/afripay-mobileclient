import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import { colors, radius } from '../theme/colors';

export default function Input({ label, error, style, secureTextEntry, ...props }) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const isSecure = !!secureTextEntry;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isSecure && !revealed}
          style={[styles.input, isSecure && styles.inputWithToggle, error && styles.inputError]}
          {...props}
        />
        {isSecure ? (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            hitSlop={10}
            style={styles.toggle}
            accessibilityLabel={revealed ? t('common.hidePassword') : t('common.showPassword')}
          >
            <Icon name={revealed ? 'eye-slash' : 'eye'} size={16} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { color: colors.textSecondary, marginBottom: 6, fontSize: 13, fontWeight: '600' },
  inputRow: { position: 'relative', justifyContent: 'center' },
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
  inputWithToggle: { paddingRight: 44 },
  inputError: { borderColor: colors.danger },
  toggle: {
    position: 'absolute',
    right: 4,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
});

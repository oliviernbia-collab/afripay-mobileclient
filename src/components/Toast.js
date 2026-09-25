import React, { useCallback, useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { colors, radius } from '../theme/colors';

const VARIANTS = {
  success: { color: colors.success, icon: 'circle-check' },
  error: { color: colors.danger, icon: 'circle-xmark' },
  warning: { color: colors.warning, icon: 'triangle-exclamation' },
  info: { color: colors.info, icon: 'circle-info' },
};

// Bannière de feedback in-app (remplace les popups Alert.alert natifs pour les retours
// purement informatifs après une validation) — cohérente avec la charte AfriPay.
export default function Toast({ toast, onHide }) {
  const insets = useSafeAreaInsets();
  const [translateY] = useState(() => new Animated.Value(-80));
  const [opacity] = useState(() => new Animated.Value(0));

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -80, duration: 160, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start(({ finished }) => finished && onHide());
  }, [translateY, opacity, onHide]);

  useEffect(() => {
    if (!toast) return undefined;
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(hide, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, translateY, opacity, hide]);

  if (!toast) return null;
  const variant = VARIANTS[toast.type] || VARIANTS.info;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + 8, transform: [{ translateY }], opacity }]}
    >
      <Pressable
        onPress={hide}
        style={[styles.toast, { borderColor: variant.color, backgroundColor: `${variant.color}22` }]}
      >
        <Icon name={variant.icon} size={18} color={variant.color} />
        <Text style={styles.text} numberOfLines={3}>
          {toast.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
    elevation: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  text: { color: colors.white, fontSize: 13, flex: 1 },
});

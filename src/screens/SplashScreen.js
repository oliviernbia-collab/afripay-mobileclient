import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BrandHeader from '../components/BrandHeader';
import { colors, brandGradientFull } from '../theme/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <BrandHeader size="large" />
      <ActivityIndicator color={colors.white} style={{ marginTop: 40 }} />
      <LinearGradient
        colors={[`${brandGradientFull[1]}00`, `${brandGradientFull[1]}33`]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.glow}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
});

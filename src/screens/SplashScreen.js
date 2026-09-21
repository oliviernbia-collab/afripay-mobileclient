import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import BrandHeader from '../components/BrandHeader';
import { colors } from '../theme/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <BrandHeader size="large" />
      <ActivityIndicator color={colors.white} style={{ marginTop: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
});

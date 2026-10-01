import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius } from '../theme/colors';

// `onColorBg` : le texte en `color` (ex. vert succès) perd tout contraste posé sur un fond déjà
// saturé (ex. le cadre "Solde disponible", uni turquoise depuis peu) — le badge a été conçu pour
// un fond sombre neutre. Dans ce cas, le texte/bordure passent en blanc ; seul le point garde la
// couleur de statut (repère rapide, sans dépendre du contraste pour être lisible).
export default function StatusBadge({ label, color, onColorBg = false }) {
  return (
    <View
      style={[
        styles.badge,
        onColorBg
          ? { borderColor: 'rgba(255, 255, 255, 0.6)', backgroundColor: 'rgba(255, 255, 255, 0.18)' }
          : { borderColor: color, backgroundColor: `${color}22` },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: onColorBg ? 'rgba(255, 255, 255, 0.9)' : color }]} />
      <Text style={[styles.text, { color: onColorBg ? '#FFFFFF' : color }]}>{label}</Text>
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

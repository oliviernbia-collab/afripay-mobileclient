import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme/colors';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

/**
 * Custom numeric keypad (1-9, 0, backspace) for PIN entry — matches the
 * mockup's "Définissez votre code PIN" screen.
 */
export default function PinKeypad({ onDigit, onBackspace, disabled }) {
  return (
    <View style={styles.grid}>
      {KEYS.map((key, i) => {
        if (key === '') return <View key={i} style={styles.key} />;
        if (key === 'back') {
          return (
            <Pressable
              key={i}
              disabled={disabled}
              onPress={onBackspace}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
            >
              <Icon name="delete-left" size={20} color={colors.white} />
            </Pressable>
          );
        }
        return (
          <Pressable
            key={i}
            disabled={disabled}
            onPress={() => onDigit(key)}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          >
            <Text style={styles.keyText}>{key}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  key: {
    width: '30%',
    aspectRatio: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  keyPressed: { opacity: 0.5 },
  keyText: { color: colors.white, fontSize: 24, fontWeight: '600' },
});

import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { setClientPin } from '../../api/auth';
import { colors } from '../../theme/colors';

// Shown right after registration, and reachable again from Paramètres to
// change the PIN. `mode: 'change'` (from Paramètres) makes it go back
// instead of resetting into MainTabs — kept serializable (no function
// params) so React Navigation can persist/restore state without warning.
export default function PinSetupScreen({ navigation, route }) {
  const isChange = route?.params?.mode === 'change';
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!/^\d{4,6}$/.test(pin)) {
      setError('Le code PIN doit contenir 4 à 6 chiffres.');
      return;
    }
    if (pin !== confirmation) {
      setError('Les codes PIN ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await setClientPin(pin);
      if (isChange) {
        navigation.goBack();
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      }
    } catch (e) {
      setError(e.message || 'Impossible d’enregistrer le PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{isChange ? 'Modifier votre PIN' : 'Créez votre code PIN'}</Text>
      <Text style={styles.subtitle}>
        Ce code (4 à 6 chiffres) vous sera demandé pour confirmer les transferts de 50 000 FCFA ou plus.
      </Text>
      <ErrorBanner message={error} />
      <Input
        label="Nouveau PIN"
        placeholder="••••"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        value={pin}
        onChangeText={setPin}
      />
      <Input
        label="Confirmer le PIN"
        placeholder="••••"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        value={confirmation}
        onChangeText={setConfirmation}
      />
      <GradientButton title="Enregistrer" onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 30, marginBottom: 10 },
  subtitle: { color: colors.textSecondary, marginBottom: 20, lineHeight: 20 },
});

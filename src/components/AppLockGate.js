import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, AppState } from 'react-native';
import BrandHeader from './BrandHeader';
import GradientButton from './GradientButton';
import Icon from './Icon';
import { colors } from '../theme/colors';
import { isBiometricLockEnabled, promptBiometricUnlock } from '../utils/biometricLock';

// Verrouille l'accès à MainStack derrière Face ID / empreinte quand l'option est activée dans
// Paramètres — au démarrage et à chaque retour au premier plan ("verrouillage automatique",
// cahier des charges 5.6). N'affecte jamais l'écran de connexion (AuthStack) : ce gate ne
// s'enroule qu'autour de la partie authentifiée de l'app (voir RootNavigator).
export default function AppLockGate({ children }) {
  const [lockEnabled, setLockEnabled] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const appState = useRef(AppState.currentState);

  const checkLockSetting = useCallback(async () => {
    const enabled = await isBiometricLockEnabled();
    setLockEnabled(enabled);
    if (!enabled) setUnlocked(true);
    return enabled;
  }, []);

  const attemptUnlock = useCallback(async () => {
    setError('');
    try {
      const ok = await promptBiometricUnlock();
      if (ok) setUnlocked(true);
      else setError('Authentification annulée ou échouée.');
    } catch {
      setError("Impossible de vérifier votre identité sur cet appareil.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const enabled = await checkLockSetting();
      setChecking(false);
      if (enabled) attemptUnlock();
    })();
  }, [checkLockSetting, attemptUnlock]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      // App went to background then came back to the foreground -> re-lock.
      if (appState.current.match(/inactive|background/) && next === 'active' && lockEnabled) {
        setUnlocked(false);
        attemptUnlock();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [lockEnabled, attemptUnlock]);

  if (checking) return null;
  if (unlocked) return children;

  return (
    <View style={styles.container}>
      <BrandHeader size="large" />
      <Icon name="lock" size={28} color={colors.textSecondary} style={{ marginTop: 30, marginBottom: 12 }} />
      <Text style={styles.title}>AfriPay verrouillé</Text>
      <Text style={styles.subtitle}>Authentifiez-vous pour accéder à votre compte.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <GradientButton title="Déverrouiller" onPress={attemptUnlock} style={{ marginTop: 20, width: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: colors.white, fontSize: 20, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 8, textAlign: 'center' },
  error: { color: colors.danger, fontSize: 12, marginTop: 12, textAlign: 'center' },
});

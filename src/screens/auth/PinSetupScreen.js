import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../../components/ScreenContainer';
import ErrorBanner from '../../components/ErrorBanner';
import PinDots from '../../components/PinDots';
import PinKeypad from '../../components/PinKeypad';
import { setClientPin } from '../../api/auth';
import { colors } from '../../theme/colors';

const PIN_LENGTH = 4;

// Shown right after registration, and reachable again from Paramètres to
// change the PIN. `mode: 'change'` (from Paramètres) makes it go back
// instead of resetting into MainTabs — kept serializable (no function
// params) so React Navigation can persist/restore state without warning.
export default function PinSetupScreen({ navigation, route }) {
  const { t } = useTranslation();
  const isChange = route?.params?.mode === 'change';
  // Un changement de PIN doit d'abord confirmer l'ancien (le backend l'exige désormais :
  // POST /auth/client/pin refuse la requête sans `pinActuel` dès qu'un PIN existe déjà) —
  // sans quoi une session volée suffirait à remplacer le PIN sans le connaître.
  const [stage, setStage] = useState(isChange ? 'current' : 'enter'); // 'current' | 'enter' | 'confirm'
  const [currentPin, setCurrentPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (confirmedPin) => {
    setLoading(true);
    try {
      await setClientPin(confirmedPin, isChange ? currentPin : undefined);
      if (isChange) {
        navigation.goBack();
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      }
    } catch (e) {
      setError(e.message || t('auth.pinSetup.saveError'));
      setStage(isChange ? 'current' : 'enter');
      setCurrentPin('');
      setFirstPin('');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const onDigit = (d) => {
    if (loading || pin.length >= PIN_LENGTH) return;
    setError('');
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      if (stage === 'current') {
        setTimeout(() => {
          setCurrentPin(next);
          setStage('enter');
          setPin('');
        }, 150);
      } else if (stage === 'enter') {
        setTimeout(() => {
          setFirstPin(next);
          setStage('confirm');
          setPin('');
        }, 150);
      } else {
        if (next === firstPin) {
          submit(next);
        } else {
          setTimeout(() => {
            setError(t('auth.pinSetup.mismatchError'));
            setStage('enter');
            setFirstPin('');
            setPin('');
          }, 150);
        }
      }
    }
  };

  const onBackspace = () => {
    if (loading) return;
    setPin((p) => p.slice(0, -1));
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>
        {stage === 'current'
          ? t('auth.pinSetup.titleCurrent')
          : isChange
          ? t('auth.pinSetup.titleChange')
          : stage === 'enter'
          ? t('auth.pinSetup.titleCreate')
          : t('auth.pinSetup.titleConfirm')}
      </Text>
      <Text style={styles.subtitle}>
        {stage === 'current'
          ? t('auth.pinSetup.subtitleCurrent')
          : stage === 'enter'
          ? t('auth.pinSetup.subtitleCreate')
          : t('auth.pinSetup.subtitleConfirm')}
      </Text>
      <ErrorBanner message={error} />

      <PinDots length={pin.length} minSlots={PIN_LENGTH} />

      <View style={{ marginTop: 20 }}>
        <PinKeypad onDigit={onDigit} onBackspace={onBackspace} disabled={loading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 30, marginBottom: 10, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, marginBottom: 10, lineHeight: 20, textAlign: 'center' },
});

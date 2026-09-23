import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import i18n from '../i18n';

// "Option d'authentification biométrique locale du téléphone (empreinte digitale / Face ID)
// pour l'ouverture de l'application" (cahier des charges 5.1/5.6) — distinct de la biométrie
// palmaire utilisée pour payer en magasin. La préférence est stockée en SecureStore (comme les
// tokens) puisqu'elle conditionne l'accès au compte.
const LOCK_ENABLED_KEY = 'afripay_biometric_lock_enabled';

export async function isBiometricLockEnabled() {
  const value = await SecureStore.getItemAsync(LOCK_ENABLED_KEY);
  return value === 'true';
}

export async function setBiometricLockEnabled(enabled) {
  if (enabled) {
    await SecureStore.setItemAsync(LOCK_ENABLED_KEY, 'true');
  } else {
    await SecureStore.deleteItemAsync(LOCK_ENABLED_KEY);
  }
}

export async function getBiometricCapability() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  return { available: hasHardware && isEnrolled, types };
}

export async function promptBiometricUnlock() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: i18n.t('appLockGate.promptMessage'),
    cancelLabel: i18n.t('appLockGate.promptCancelLabel'),
    disableDeviceFallback: false, // autorise le code de l'appareil en secours (cf. 4.4 "procédure de secours")
  });
  return result.success;
}

import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Human-readable device label + OS string sent at login/refresh so the backend can
// populate "Appareils connectés" (cf. DESIGN_TOKENS / cahier des charges 5.6).
export function getDeviceInfo() {
  const appareil = Device.modelName || Device.deviceName || (Platform.OS === 'ios' ? 'iPhone/iPad' : 'Appareil Android');
  const os = `${Platform.OS === 'ios' ? 'iOS' : 'Android'} ${Platform.Version ?? ''}`.trim();
  return { appareil, os };
}

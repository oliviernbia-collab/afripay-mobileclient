import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache local minimal (cahier des charges 9.4 : "consultation du solde en cache... en cas de
// perte réseau ponctuelle") — un simple get/set horodaté par clé, pas un store général. Best-effort
// partout : un stockage plein/indisponible ne doit jamais empêcher l'app de fonctionner en ligne,
// juste priver l'utilisateur de la dernière valeur connue hors-ligne.
const PREFIX = 'afripay_offline_cache:';

export async function getCached(key) {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw); // { value, cachedAt: <epoch ms> }
  } catch {
    return null;
  }
}

export async function setCached(key, value) {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify({ value, cachedAt: Date.now() }));
  } catch {
    // stockage plein/indisponible : on continue sans cache plutôt que de bloquer l'app
  }
}

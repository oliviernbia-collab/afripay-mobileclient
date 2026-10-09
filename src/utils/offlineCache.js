import * as SecureStore from 'expo-secure-store';

// Cache local minimal (cahier des charges 9.4 : "consultation du solde en cache... en cas de
// perte réseau ponctuelle") — un simple get/set horodaté par clé, pas un store général. Best-effort
// partout : un stockage plein/indisponible ne doit jamais empêcher l'app de fonctionner en ligne,
// juste priver l'utilisateur de la dernière valeur connue hors-ligne.
//
// SecureStore (Keychain/Keystore chiffré) plutôt qu'AsyncStorage : les valeurs mises en cache ici
// sont des données financières (solde, historique récent) — un extrait de backup, un accès root/
// jailbreak, ou une autre app sur un vieux Android avec stockage partagé ne doit pas pouvoir les
// lire en clair. Les valeurs restent petites (solde/résumé, pas l'historique complet), donc la
// limite de taille de SecureStore (~2 Ko côté iOS Keychain) n'est pas un problème ici.
const PREFIX = 'afripay_offline_cache_';

export async function getCached(key) {
  try {
    const raw = await SecureStore.getItemAsync(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw); // { value, cachedAt: <epoch ms> }
  } catch {
    return null;
  }
}

export async function setCached(key, value) {
  try {
    await SecureStore.setItemAsync(PREFIX + key, JSON.stringify({ value, cachedAt: Date.now() }));
  } catch {
    // stockage plein/indisponible : on continue sans cache plutôt que de bloquer l'app
  }
}

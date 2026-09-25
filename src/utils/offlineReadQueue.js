import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

/**
 * File d'attente pour UNE action précise : marquer une notification comme lue pendant une perte
 * réseau ponctuelle (cahier des charges 9.4). Délibérément spécifique plutôt qu'une file générique
 * multi-types — c'est la seule action de l'app qui est à la fois sûre à rejouer plus tard sans
 * confirmation de l'utilisateur (idempotente : marquer deux fois "lu" ne fait rien de plus) et sans
 * enjeu financier. Les transferts/paiements ne sont volontairement PAS mis en file ici : rejouer un
 * transfert après coup sans que l'utilisateur le revoie serait risqué (montant/destinataire
 * périmés, double exécution perçue) — ils continuent d'échouer clairement et de se refaire à la main.
 *
 * `init(executor)` doit être appelé une seule fois au démarrage de l'app (voir App.js) avec la
 * vraie fonction d'API (markNotificationRead) — passée en paramètre plutôt qu'importée ici pour
 * éviter un import circulaire avec api/notifications.js, qui appelle enqueue() de son côté.
 */
const QUEUE_KEY = 'afripay_offline_read_queue';
let executor = null;
let flushing = false;
let unsubscribeNetInfo = null;

async function readQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeQueue(ids) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(ids));
  } catch {
    // best-effort — voir offlineCache.js
  }
}

export async function enqueueMarkRead(notificationId) {
  const ids = await readQueue();
  if (!ids.includes(notificationId)) {
    ids.push(notificationId);
    await writeQueue(ids);
  }
}

export async function flushReadQueue() {
  if (flushing || !executor) return;
  flushing = true;
  try {
    const ids = await readQueue();
    if (!ids.length) return;
    const stillFailing = [];
    for (const id of ids) {
      try {
        await executor(id);
      } catch {
        stillFailing.push(id); // toujours hors-ligne (ou en échec) — on retentera au prochain flush
      }
    }
    await writeQueue(stillFailing);
  } finally {
    flushing = false;
  }
}

export function initOfflineReadQueue(markReadFn) {
  executor = markReadFn;
  if (unsubscribeNetInfo) return; // déjà initialisé (ex: re-render de App.js)
  unsubscribeNetInfo = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      flushReadQueue();
    }
  });
  // Tente aussi un flush immédiat au démarrage, au cas où des entrées attendaient déjà d'une
  // session précédente fermée hors-ligne.
  flushReadQueue();
}

/**
 * AfriPay Client — API base URL configuration.
 *
 * The backend runs on port 4000 (see backend/.env). Depending on how you run
 * this app, "localhost" means a different machine, so pick the right value:
 *
 *  1) Physical phone via Expo Go on the same Wi-Fi as this computer (the
 *     normal way to test this app) -> use this computer's LAN IP.
 *     This machine's LAN IP is 192.168.1.71, so we default to that.
 *     If your computer's IP is different, either edit LAN_IP below or run
 *     `ipconfig` (Windows) / `ifconfig` (Mac/Linux) to find yours.
 *
 *  2) Android emulator (Android Studio) -> the emulator maps the host
 *     machine to the special address 10.0.2.2, so use that instead.
 *
 *  3) iOS simulator (Mac only) -> the simulator shares the host's network
 *     stack, so "localhost" works directly.
 *
 * Switch MODE below to change which one is active. Defaults to 'lan' since
 * that's the primary way this app is tested (physical device + Expo Go).
 */

const LAN_IP = '192.168.1.71';
const PORT = 4000;

const MODE = 'lan'; // 'lan' | 'android-emulator' | 'ios-simulator'

const HOSTS = {
  lan: LAN_IP,
  'android-emulator': '10.0.2.2',
  'ios-simulator': 'localhost',
};

const DEV_HOST = HOSTS[MODE] || LAN_IP;

// En build de production (__DEV__ === false), l'URL de l'API doit venir de EXPO_PUBLIC_API_URL
// (définie au build, ex. via eas.json) et être en HTTPS — jamais l'IP locale de développement en
// clair, qui exposerait PIN, mot de passe et tokens sur le réseau (Wi-Fi public/partagé). Le
// démarrage échoue volontairement si ce n'est pas configuré, plutôt que de se rabattre
// silencieusement sur du HTTP.
const PROD_API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!__DEV__ && (!PROD_API_URL || !PROD_API_URL.startsWith('https://'))) {
  throw new Error(
    'EXPO_PUBLIC_API_URL doit être défini avec une URL https:// pour un build de production (voir src/config/api.js).'
  );
}

export const API_HOST = __DEV__ ? DEV_HOST : new URL(PROD_API_URL).host;
export const API_BASE_URL = __DEV__ ? `http://${DEV_HOST}:${PORT}/api` : `${PROD_API_URL.replace(/\/$/, '')}/api`;
// Used to build absolute URLs for files served under /uploads/<file>
export const SERVER_ORIGIN = __DEV__ ? `http://${DEV_HOST}:${PORT}` : PROD_API_URL.replace(/\/$/, '');

// Photos / documents are now stored on Cloudinary and come back as absolute
// https:// URLs. Older records may still hold a relative "/uploads/<file>"
// path, so only prefix with SERVER_ORIGIN when the value isn't already absolute.
export function resolveMediaUrl(url) {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `${SERVER_ORIGIN}${url}`;
}

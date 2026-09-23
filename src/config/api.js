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

export const API_HOST = HOSTS[MODE] || LAN_IP;
export const API_BASE_URL = `http://${API_HOST}:${PORT}/api`;
// Used to build absolute URLs for files served under /uploads/<file>
export const SERVER_ORIGIN = `http://${API_HOST}:${PORT}`;

// Photos / documents are now stored on Cloudinary and come back as absolute
// https:// URLs. Older records may still hold a relative "/uploads/<file>"
// path, so only prefix with SERVER_ORIGIN when the value isn't already absolute.
export function resolveMediaUrl(url) {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `${SERVER_ORIGIN}${url}`;
}

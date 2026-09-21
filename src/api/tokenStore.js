import * as SecureStore from 'expo-secure-store';

// Tokens are sensitive -> expo-secure-store (Keychain/Keystore backed).
const ACCESS_KEY = 'afripay_access_token';
const REFRESH_KEY = 'afripay_refresh_token';

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function saveTokens({ accessToken, refreshToken }) {
  if (accessToken) await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  if (refreshToken) await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

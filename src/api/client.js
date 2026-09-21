import { API_BASE_URL } from '../config/api';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './tokenStore';

// Custom error carrying the HTTP status + backend message/details so screens
// can branch on e.g. status === 403 (plafond recharge) without string-matching.
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let onUnauthorized = null;
// Called by AuthContext so the client can force a logout when refresh fails.
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

let refreshPromise = null;

async function doRefresh() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new ApiError(401, 'Session expirée');
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new ApiError(res.status, json.message || 'Refresh échoué');
  }
  await saveTokens(json.data);
  return json.data.accessToken;
}

/**
 * Core request helper.
 * - body: plain object -> sent as JSON. FormData instance -> sent as-is (multipart).
 * - auth: true (default) attaches Bearer token and retries once via /auth/refresh on 401.
 */
export async function request(path, { method = 'GET', body, auth = true, isForm = false, query } = {}) {
  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const qs = Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    if (qs) url += `?${qs}`;
  }

  const doFetch = async (token) => {
    const headers = {};
    if (!isForm) headers['Content-Type'] = 'application/json';
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
    let json;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    return { res, json };
  };

  let token = auth ? await getAccessToken() : null;
  let { res, json } = await doFetch(token);

  if (auth && res.status === 401 && token) {
    // Access token likely expired -> refresh once, then retry the request.
    try {
      if (!refreshPromise) refreshPromise = doRefresh();
      const newToken = await refreshPromise;
      refreshPromise = null;
      ({ res, json } = await doFetch(newToken));
    } catch {
      refreshPromise = null;
      await clearTokens();
      if (onUnauthorized) onUnauthorized();
      throw new ApiError(401, 'Session expirée, veuillez vous reconnecter');
    }
  }

  if (!res.ok || !json || json.success === false) {
    const message = (json && json.message) || `Erreur réseau (${res.status})`;
    throw new ApiError(res.status, message, json && json.details);
  }

  return json.data;
}

export const get = (path, opts) => request(path, { ...opts, method: 'GET' });
export const post = (path, body, opts) => request(path, { ...opts, method: 'POST', body });

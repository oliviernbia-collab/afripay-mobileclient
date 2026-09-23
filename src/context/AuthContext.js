import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getAccessToken, saveTokens, clearTokens } from '../api/tokenStore';
import { setUnauthorizedHandler } from '../api/client';
import * as authApi from '../api/auth';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { language, setLanguage } = useLanguage();
  const [user, setUser] = useState(null); // public user object from the API
  const [booting, setBooting] = useState(true); // true while we check for a stored session

  // Account-level preference (users.langue) is the source of truth when an *existing* session
  // resumes (boot restore, login) — logging in on a new device picks up the language last
  // chosen anywhere, rather than leaving this device's local/default one. `sync: false` avoids
  // immediately PATCHing back the value we just read.
  const adoptAccountLanguage = useCallback(
    (account) => {
      if (account?.langue) setLanguage(account.langue, { sync: false });
    },
    [setLanguage]
  );

  const logout = useCallback(async () => {
    await clearTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });
  }, []);

  // On app start: if we have a stored token, validate it via /auth/me.
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const me = await authApi.getMe();
          setUser(me.user);
          adoptAccountLanguage(me.user);
        }
      } catch {
        // token invalid/expired and refresh failed -> stay logged out
        await clearTokens();
      } finally {
        setBooting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (telephone, motDePasse) => {
      const data = await authApi.loginClient(telephone, motDePasse);
      await saveTokens(data);
      setUser(data.user);
      adoptAccountLanguage(data.user);
      return data.user;
    },
    [adoptAccountLanguage]
  );

  const register = useCallback(
    async (payload) => {
      const data = await authApi.registerClient(payload);
      await saveTokens(data);
      setUser(data.user);
      // New account: push the language already chosen in-app (pre-signup) to the server,
      // rather than adopting the brand-new account's meaningless 'fr' default.
      if (language) {
        authApi.updateClientLanguage(language).catch(() => {});
      }
      return data.user;
    },
    [language]
  );

  const refreshUser = useCallback(async () => {
    const me = await authApi.getMe();
    setUser(me.user);
    return me.user;
  }, []);

  const value = useMemo(
    () => ({ user, booting, login, register, logout, refreshUser, setUser }),
    [user, booting, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

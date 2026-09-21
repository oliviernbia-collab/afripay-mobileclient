import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getAccessToken, saveTokens, clearTokens } from '../api/tokenStore';
import { setUnauthorizedHandler } from '../api/client';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // public user object from the API
  const [booting, setBooting] = useState(true); // true while we check for a stored session

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
        }
      } catch {
        // token invalid/expired and refresh failed -> stay logged out
        await clearTokens();
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const login = useCallback(async (telephone, motDePasse) => {
    const data = await authApi.loginClient(telephone, motDePasse);
    await saveTokens(data);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.registerClient(payload);
    await saveTokens(data);
    setUser(data.user);
    return data.user;
  }, []);

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

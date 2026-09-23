import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n, { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../i18n';
import { getAccessToken } from '../api/tokenStore';
import { updateClientLanguage } from '../api/auth';

const STORAGE_KEY = 'afripay_language';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      let next = DEFAULT_LANGUAGE;
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
          next = stored;
        } else {
          const deviceTag = Localization.getLocales?.()[0]?.languageCode;
          if (deviceTag && SUPPORTED_LANGUAGES.includes(deviceTag)) next = deviceTag;
        }
      } catch {
        // best-effort — falls back to DEFAULT_LANGUAGE
      }
      await i18n.changeLanguage(next);
      setLanguageState(next);
      setReady(true);
    })();
  }, []);

  // `sync: true` (the default, used by the flag switcher) also pushes the choice to the
  // backend (users.langue) so server-generated notifications later render in that language.
  // AuthContext passes `sync: false` when it adopts the account's stored language on login,
  // to avoid uselessly PATCHing back the value it just read.
  const setLanguage = useCallback(async (next, { sync = true } = {}) => {
    if (!SUPPORTED_LANGUAGES.includes(next)) return;
    await i18n.changeLanguage(next);
    setLanguageState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // best-effort persistence — language still applies for this session
    }
    if (sync) {
      try {
        const token = await getAccessToken();
        if (token) await updateClientLanguage(next);
      } catch {
        // best-effort — offline or logged out, local preference still applies
      }
    }
  }, []);

  const value = useMemo(() => ({ language, setLanguage, ready }), [language, setLanguage, ready]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

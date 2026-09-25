import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/i18n';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import RootNavigator from './src/navigation/RootNavigator';
import { initOfflineReadQueue } from './src/utils/offlineReadQueue';
import { markNotificationRead } from './src/api/notifications';

export default function App() {
  // Démarré une seule fois pour toute la durée de vie de l'app (pas par écran) : une notification
  // marquée lue pendant une perte réseau doit être rejouée dès que la connexion revient, même si
  // l'utilisateur a depuis quitté l'écran Notifications — voir utils/offlineReadQueue.js.
  useEffect(() => {
    initOfflineReadQueue(markNotificationRead);
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { socket } from '../realtime/socket';

const NotificationsContext = createContext(null);

/**
 * Pastille "non lu" sur la cloche du Dashboard — purement pilotée par l'événement temps réel
 * `notification:new` (voir backend/src/services/notificationService.js), sans appel réseau
 * dédié : pas besoin d'un endpoint "nombre de non lus", juste un booléen allumé dès qu'une
 * notification arrive et éteint quand l'utilisateur ouvre l'écran Notifications
 * (NotificationsScreen appelle `markSeen()` au focus).
 */
export function NotificationsProvider({ children }) {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const onNew = () => setHasUnread(true);
    socket.on('notification:new', onNew);
    return () => socket.off('notification:new', onNew);
  }, []);

  const markSeen = useCallback(() => setHasUnread(false), []);

  const value = useMemo(() => ({ hasUnread, markSeen }), [hasUnread, markSeen]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotificationsBadge() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotificationsBadge must be used within NotificationsProvider');
  return ctx;
}

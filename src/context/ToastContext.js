import React, { createContext, useCallback, useContext, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 3200;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, type = 'info', duration = DEFAULT_DURATION) => {
    if (!message) return;
    // Un seul toast affiché à la fois : le nouveau remplace l'ancien plutôt que de s'empiler.
    setToast({ message, type, duration, key: Date.now() });
  }, []);

  const hide = useCallback(() => setToast(null), []);

  const value = {
    showToast: show,
    showSuccess: useCallback((message, duration) => show(message, 'success', duration), [show]),
    showError: useCallback((message, duration) => show(message, 'error', duration), [show]),
    showWarning: useCallback((message, duration) => show(message, 'warning', duration), [show]),
    showInfo: useCallback((message, duration) => show(message, 'info', duration), [show]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toast={toast} onHide={hide} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans un ToastProvider');
  return ctx;
}

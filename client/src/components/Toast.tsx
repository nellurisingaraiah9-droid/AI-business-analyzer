import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
    warning: (msg: string) => addToast('warning', msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-success shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-danger shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-warning shrink-0" />,
            info: <Info className="w-5 h-5 text-info shrink-0" />,
          };

          const borders = {
            success: 'border-success/30 bg-bg-card',
            error: 'border-danger/30 bg-bg-card',
            warning: 'border-warning/30 bg-bg-card',
            info: 'border-info/30 bg-bg-card',
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl animate-slideInRight ${borders[t.type]}`}
            >
              {icons[t.type]}
              <div className="flex-1 text-sm text-text-primary leading-tight pt-0.5">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-text-secondary hover:text-text-primary p-0.5 rounded transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

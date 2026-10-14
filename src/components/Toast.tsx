import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  React.useEffect(() => {
    const duration = toast.duration ?? 4000;
    const timer = setTimeout(() => onRemove(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const typeStyles: Record<ToastType, string> = {
    success: 'bg-success text-inverse border-success',
    error: 'bg-error text-inverse border-error',
    warning: 'bg-warning text-inverse border-warning',
    info: 'bg-primary text-inverse border-primary',
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    error: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    warning: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    info: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-sm border shadow-lg min-w-[300px] max-w-md animate-slide-in ${typeStyles[toast.type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-body">{toast.title}</p>
        {toast.message && <p className="text-body-sm opacity-90 mt-0.5">{toast.message}</p>}
        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onClick();
              onRemove(toast.id);
            }}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Helper functions for common toast patterns
export const toastHelpers = {
  success: (title: string, message?: string, action?: Toast['action']) =>
    ({ type: 'success' as const, title, message, action }),
  
  error: (title: string, message?: string, action?: Toast['action']) =>
    ({ type: 'error' as const, title, message, action }),
  
  warning: (title: string, message?: string, action?: Toast['action']) =>
    ({ type: 'warning' as const, title, message, action }),
  
  info: (title: string, message?: string, action?: Toast['action']) =>
    ({ type: 'info' as const, title, message, action }),
  
  saved: (count?: number, entity?: string) => ({
    type: 'success' as const,
    title: 'Saved',
    message: count ? `Saved ${count} ${entity || 'records'}` : 'Changes saved successfully',
  }),
  
  deleted: (entity: string) => ({
    type: 'success' as const,
    title: 'Deleted',
    message: `${entity} removed successfully`,
  }),
  
  imported: (count: number, entity: string) => ({
    type: 'success' as const,
    title: 'Imported',
    message: `Successfully imported ${count} ${entity}`,
  }),
  
  exportReady: (filename: string) => ({
    type: 'success' as const,
    title: 'Export Ready',
    message: `${filename} downloaded`,
  }),
  
  backupExported: () => ({
    type: 'success' as const,
    title: 'Backup Exported',
    message: 'Complete backup downloaded as JSON',
  }),
  
  backupRestored: () => ({
    type: 'success' as const,
    title: 'Backup Restored',
    message: 'All data restored successfully',
  }),
  
  syncStarted: () => ({
    type: 'info' as const,
    title: 'Sync Started',
    message: 'Synchronizing pending changes...',
    duration: 0, // Persistent until sync completes
  }),
  
  syncCompleted: (count: number) => ({
    type: 'success' as const,
    title: 'Sync Completed',
    message: `${count} changes synchronized`,
  }),
  
  syncFailed: (error: string) => ({
    type: 'error' as const,
    title: 'Sync Failed',
    message: error,
    action: { label: 'Retry', onClick: () => {} },
  }),
  
  offline: () => ({
    type: 'warning' as const,
    title: 'Offline Mode',
    message: 'Changes saved locally. Will sync when online.',
    duration: 6000,
  }),
  
  online: () => ({
    type: 'success' as const,
    title: 'Back Online',
    message: 'Connection restored. Syncing changes...',
  }),
  
  validationError: (message: string) => ({
    type: 'error' as const,
    title: 'Validation Error',
    message,
  }),
};
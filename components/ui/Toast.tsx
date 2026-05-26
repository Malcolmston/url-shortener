'use client';
import { type ReactNode, createContext, useContext, useState, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import type { ToastItem, ToastVariant } from '@/hooks/useToast';
import { ToastContext } from '@/hooks/useToast';

const ICONS: Record<ToastVariant, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

const STYLES: Record<ToastVariant, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300',
  error:   'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300',
  info:    'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
};

function ToastItemComponent({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(item.id), item.duration ?? 5000);
    return () => clearTimeout(t);
  }, [item, onRemove]);

  return (
    <div className={clsx('flex items-start gap-3 px-4 py-3 rounded-xl border shadow-md text-sm animate-slide-up', STYLES[item.variant])}>
      <span className="font-bold mt-0.5">{ICONS[item.variant]}</span>
      <p className="flex-1">{item.message}</p>
      <button onClick={() => onRemove(item.id)} className="opacity-60 hover:opacity-100 ml-2 mt-0.5" aria-label="Dismiss">✕</button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = 'info', duration?: number) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItemComponent item={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

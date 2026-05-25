import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark, faTriangleExclamation, faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons';

const ToastContext = createContext(null);

const ICONS = {
  success: faCircleCheck,
  error:   faCircleXmark,
  warning: faTriangleExclamation,
  info:    faCircleInfo,
};

const STYLES = {
  success: { wrap: 'bg-emerald-100 dark:bg-emerald-950/60', icon: 'text-emerald-600 dark:text-emerald-400' },
  error:   { wrap: 'bg-red-100 dark:bg-red-950/60',     icon: 'text-red-600 dark:text-red-400' },
  warning: { wrap: 'bg-amber-100 dark:bg-amber-950/60', icon: 'text-amber-600 dark:text-amber-400' },
  info:    { wrap: 'bg-violet-100 dark:bg-violet-950/60', icon: 'text-violet-600 dark:text-violet-400' },
};

let toastId = 0;

function ToastItem({ id, type = 'info', title, message, onRemove }) {
  const [visible, setVisible] = React.useState(true);
  const { wrap, icon } = STYLES[type];

  useEffect(() => {
    const duration = type === 'error' || type === 'warning' ? 8000 : 5000;
    const timer = setTimeout(() => { setVisible(false); setTimeout(() => onRemove(id), 300); }, duration);
    return () => clearTimeout(timer);
  }, [id, type, onRemove]);

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={[
        'flex items-start gap-3 min-w-[280px] max-w-sm bg-white dark:bg-slate-800',
        'rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 px-4 py-3',
        'transition-all duration-300',
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4',
      ].filter(Boolean).join(' ')}
    >
      <div className={['w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center', wrap].join(' ')}>
        <FontAwesomeIcon icon={ICONS[type]} className={['text-sm', icon].join(' ')} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-gray-900 dark:text-slate-50">{title}</p>}
        {message && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{message}</p>}
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(id), 300); }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
        aria-label="Dismiss notification"
      >
        <FontAwesomeIcon icon={faXmark} className="text-xs" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const remove = useCallback((id) => setToasts(ts => ts.filter(t => t.id !== id)), []);
  const add = useCallback((toast) => {
    setToasts(ts => [...ts, { id: ++toastId, ...toast }]);
  }, []);

  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      <div
        className="fixed bottom-5 right-5 flex flex-col gap-2 z-[60]"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return {
    success: (title, message) => ctx.add({ type: 'success', title, message }),
    error:   (title, message) => ctx.add({ type: 'error',   title, message }),
    warning: (title, message) => ctx.add({ type: 'warning', title, message }),
    info:    (title, message) => ctx.add({ type: 'info',    title, message }),
  };
}

export default ToastProvider;

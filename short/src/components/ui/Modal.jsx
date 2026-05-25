import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  shakeOnBackdrop = true,
}) {
  const panelRef = useRef(null);
  const [isShaking, setIsShaking] = React.useState(false);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const el = panelRef.current;
    if (el) {
      const firstFocusable = el.querySelector('button, input, textarea, select, a[href]');
      firstFocusable?.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  function handleBackdrop(e) {
    if (e.target !== e.currentTarget) return;
    if (shakeOnBackdrop) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 800);
    } else {
      onClose?.();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={panelRef}
        className={[
          'w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col',
          'ring-1 ring-black/5 dark:ring-white/5',
          sizes[size],
          isShaking ? 'animate__animated animate__headShake' : '',
        ].filter(Boolean).join(' ')}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-slate-50 font-display">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900 rounded-b-2xl border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Confirmation dialog variant
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-2">
        <div className={[
          'mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4',
          variant === 'danger' ? 'bg-red-100 dark:bg-red-950' : 'bg-violet-100 dark:bg-violet-950',
        ].join(' ')}>
          <span className={variant === 'danger' ? 'text-red-600' : 'text-violet-600'}>⚠</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50 font-display">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">{message}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="h-10 px-4 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm?.(); onClose?.(); }}
            className={[
              'h-10 px-4 text-sm font-medium rounded-lg text-white transition-colors',
              variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700',
            ].join(' ')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

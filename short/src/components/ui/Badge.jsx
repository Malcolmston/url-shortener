import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const variants = {
  active:   'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  private:  'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600',
  deleted:  'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900',
  warning:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900',
  info:     'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
  neutral:  'bg-gray-100 text-gray-700 border-transparent dark:bg-slate-700 dark:text-slate-300',
  count:    'bg-gray-100 text-gray-700 border-transparent font-mono dark:bg-slate-700 dark:text-slate-300',
};

const sizes = {
  sm: 'px-1.5 py-0 text-2xs',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm',
};

export default function Badge({ children, variant = 'neutral', size = 'md', icon, className = '' }) {
  return (
    <span className={[
      'inline-flex items-center gap-1 rounded-full border font-medium',
      variants[variant],
      sizes[size],
      className,
    ].filter(Boolean).join(' ')}>
      {icon && <FontAwesomeIcon icon={icon} aria-hidden="true" className="text-[0.65rem]" />}
      {children}
    </span>
  );
}

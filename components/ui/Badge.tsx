import { type ReactNode } from 'react';
import { clsx } from 'clsx';

export type BadgeVariant = 'active' | 'private' | 'deleted' | 'warning' | 'info' | 'neutral' | 'success';

const VARIANTS: Record<BadgeVariant, string> = {
  active:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  private: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

interface BadgeProps { variant?: BadgeVariant; children: ReactNode; className?: string; }

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', VARIANTS[variant], className)}>
      {children}
    </span>
  );
}

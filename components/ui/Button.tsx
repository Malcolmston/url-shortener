'use client';
import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode, forwardRef } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:   'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm shadow-brand-600/20',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
  ghost:     'text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800',
  danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/20',
  outline:   'border-2 border-brand-600 text-brand-600 hover:bg-brand-50 active:bg-brand-100 dark:hover:bg-brand-950',
  link:      'text-brand-600 hover:underline underline-offset-2',
};

const SIZES: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-md',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, leftIcon, rightIcon, href, children, className, disabled, type = 'button', ...props },
  ref
) {
  const base = clsx(
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variant !== 'link' && SIZES[size],
    VARIANTS[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        {leftIcon}{children}{rightIcon}
      </Link>
    );
  }

  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={base} {...props}>
      {loading ? <Spinner size="sm" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const variants = {
  primary:   'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800 disabled:bg-violet-300',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50',
  ghost:     'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50',
  danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
  outline:   'bg-transparent text-violet-600 border border-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:border-violet-400 dark:hover:bg-violet-950 disabled:opacity-50',
  link:      'bg-transparent text-violet-600 hover:underline dark:text-violet-400 disabled:opacity-50 p-0',
};

const sizes = {
  xs: 'h-7 px-2.5 text-xs rounded-md gap-1',
  sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-5 text-base rounded-lg gap-2',
  xl: 'h-12 px-6 text-base rounded-xl gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  // Default to 'button' to prevent accidental form submissions when this
  // component is used inside a <form> without an explicit type override.
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
        'active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {isLoading ? (
        <FontAwesomeIcon icon={faSpinner} className="animate-spin" aria-hidden="true" />
      ) : leftIcon ? (
        <FontAwesomeIcon icon={leftIcon} aria-hidden="true" />
      ) : null}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && <FontAwesomeIcon icon={rightIcon} aria-hidden="true" />}
      {isLoading && <span className="sr-only">Loading</span>}
    </button>
  );
}

// Icon-only button variant
export function IconButton({ icon, label, variant = 'ghost', size = 'md', className = '', type = 'button', ...props }) {
  const iconSizes = { xs: 'h-7 w-7', sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-10 w-10', xl: 'h-11 w-11' };
  return (
    <button
      type={type}
      aria-label={label}
      className={[
        'inline-flex items-center justify-center rounded-lg transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
        'active:scale-[0.97]',
        variants[variant],
        iconSizes[size],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      <FontAwesomeIcon icon={icon} aria-hidden="true" />
    </button>
  );
}

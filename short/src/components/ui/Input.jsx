import React, { forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';

const inputBase = [
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900',
  'placeholder:text-gray-400 transition-colors duration-150',
  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500',
  'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
  'dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500',
  'dark:focus:ring-violet-400/20 dark:focus:border-violet-400',
].join(' ');

export const Input = forwardRef(function Input({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  rightElement,
  size = 'md',
  className = '',
  id,
  ...props
}, ref) {
  const sizeClasses = { sm: 'h-8 text-xs', md: 'h-10 text-sm', lg: 'h-12 text-base' };
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
            <FontAwesomeIcon icon={leftIcon} aria-hidden="true" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            inputBase,
            sizeClasses[size],
            error ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-gray-300 dark:border-slate-600',
            leftIcon  ? 'pl-9'  : '',
            rightIcon || rightElement ? 'pr-9' : '',
            className,
          ].filter(Boolean).join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
        {rightIcon && !rightElement && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FontAwesomeIcon icon={rightIcon} aria-hidden="true" />
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="flex items-center gap-1 text-xs text-red-500">
          <FontAwesomeIcon icon={faCircleXmark} aria-hidden="true" />
          {error}
        </p>
      )}
      {helper && !error && (
        <p id={`${inputId}-helper`} className="text-xs text-gray-500 dark:text-slate-400">{helper}</p>
      )}
    </div>
  );
});

export function Textarea({ label, error, helper, className = '', id, rows = 4, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={[
          inputBase,
          'resize-y min-h-[80px]',
          error ? 'border-red-400' : 'border-gray-300 dark:border-slate-600',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

export default Input;

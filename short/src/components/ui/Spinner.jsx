import React from 'react';

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
    xl: 'w-12 h-12 border-[3px]',
  };
  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        'rounded-full border-violet-600 border-t-transparent animate-spin',
        sizes[size],
        className,
      ].filter(Boolean).join(' ')}
    />
  );
}

export function PageSpinner({ message = 'Loading…' }) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

import React from 'react';

export default function ProgressBar({ value = 0, className = '', animated = false }) {
  // value: 0-100
  const getColor = (v) => {
    if (v === 100) return 'bg-emerald-500';
    if (v >= 95)   return 'bg-violet-600 animate-pulse';
    if (v >= 30)   return 'bg-violet-600';
    return 'bg-amber-500';
  };

  return (
    <div className={['h-1.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden', className].join(' ')}>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className={['h-full rounded-full transition-all duration-300 ease-out', getColor(value)].join(' ')}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

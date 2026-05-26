import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function Card({ children, className = '', padding = 'default', hover = false, ...props }) {
  const paddings = {
    none:    '',
    sm:      'p-4',
    default: 'p-6',
    lg:      'p-8',
  };
  return (
    <div
      className={[
        'bg-white rounded-xl shadow-sm border border-gray-200',
        'dark:bg-slate-800 dark:border-slate-700',
        hover ? 'transition-shadow duration-200 hover:shadow-md cursor-pointer' : '',
        paddings[padding],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={['px-6 py-4 border-b border-gray-100 dark:border-slate-700', className].join(' ')} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={['p-6', className].join(' ')} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={['px-6 py-4 bg-gray-50 dark:bg-slate-900 rounded-b-xl border-t border-gray-100 dark:border-slate-700', className].join(' ')} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon, color = 'violet', delta, className = '' }) {
  const colors = {
    violet:  { bg: 'bg-violet-50 dark:bg-violet-950/30', icon: 'text-violet-600 dark:text-violet-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    sky:     { bg: 'bg-sky-50 dark:bg-sky-950/30', icon: 'text-sky-600 dark:text-sky-400' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-950/30', icon: 'text-amber-600 dark:text-amber-400' },
    red:     { bg: 'bg-red-50 dark:bg-red-950/30', icon: 'text-red-600 dark:text-red-400' },
  };
  const { bg, icon: iconColor } = colors[color] || colors.violet;

  return (
    <Card className={['flex items-center gap-4 p-5', className].join(' ')}>
      <div className={['w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', bg].join(' ')}>
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            className={['text-lg', iconColor].join(' ')}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-slate-50 font-display leading-none">{value}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-1">{label}</p>
        {delta && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-0.5">
            ▲ {delta}
          </p>
        )}
      </div>
    </Card>
  );
}

export default Card;

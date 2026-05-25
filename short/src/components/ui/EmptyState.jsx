import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from './Button';

export default function EmptyState({ icon, title, description, action, actionLabel, className = '' }) {
  return (
    <div className={['flex flex-col items-center justify-center py-16 text-center px-4', className].join(' ')}>
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className="text-gray-300 dark:text-slate-600 mb-4"
          style={{ fontSize: '3rem' }}
          aria-hidden="true"
        />
      )}
      <h3 className="text-base font-semibold text-gray-700 dark:text-slate-300 font-display">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs mx-auto mt-2">{description}</p>
      )}
      {action && actionLabel && (
        <div className="mt-6">
          <Button onClick={action} variant="primary">{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}

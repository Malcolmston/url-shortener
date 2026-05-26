import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps { children: ReactNode; className?: string; }

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx('bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={clsx('px-6 py-4 border-b border-gray-200 dark:border-gray-800', className)}>{children}</div>;
}

export function CardBody({ children, className }: CardProps) {
  return <div className={clsx('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={clsx('px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl', className)}>{children}</div>;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  delta?: string;
  colorClass?: string;
}

export function StatCard({ label, value, icon, delta, colorClass = 'text-brand-600 bg-brand-50 dark:bg-brand-950' }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        {icon && <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', colorClass)}>{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {delta && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{delta}</p>}
    </Card>
  );
}

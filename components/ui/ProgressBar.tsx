import { clsx } from 'clsx';

type Stage = 'idle' | 'uploading' | 'done' | 'error';

const STAGE_COLORS: Record<Stage, string> = {
  idle:      'bg-gray-300 dark:bg-gray-600',
  uploading: 'bg-brand-500 animate-pulse',
  done:      'bg-emerald-500',
  error:     'bg-red-500',
};

interface ProgressBarProps {
  value: number; // 0–100
  stage?: Stage;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, stage = 'uploading', showLabel, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={clsx('w-full', className)}>
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-300', STAGE_COLORS[stage])}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && <p className="text-xs text-gray-500 mt-1 text-right">{clamped}%</p>}
    </div>
  );
}

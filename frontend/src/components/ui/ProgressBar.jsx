import { cn } from '../../utils/cn';

// value is a percentage (0-100). The bar turns green when everything is done.
export function ProgressBar({ value, label, className }) {
  const percent = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', percent === 100 ? 'bg-emerald-500' : 'bg-brand-600')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

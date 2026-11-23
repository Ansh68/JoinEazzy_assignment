import { useId } from 'react';
import { cn } from '../../utils/cn';

export function Textarea({ label, error, hint, className, rows = 4, ...props }) {
  const id = useId();
  const messageId = `${id}-message`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        className={cn(
          'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
          'focus:outline-2 focus:outline-offset-0 focus:outline-brand-500',
          error ? 'border-red-400' : 'border-slate-300',
        )}
        {...props}
      />
      {(error || hint) && (
        <p id={messageId} className={cn('mt-1.5 text-xs', error ? 'text-red-600' : 'text-slate-500')}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

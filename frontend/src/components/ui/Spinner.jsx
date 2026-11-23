import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

const SLOW_LOAD_MS = 8000;

export function Spinner({ className }) {
  return (
    <svg className={cn('size-5 animate-spin text-brand-600', className)} viewBox="0 0 24 24" fill="none" role="status" aria-label="Loading">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// Centred spinner for whole pages or sections that are still loading.
// After a few seconds it explains the delay: free hosting puts idle servers to sleep.
export function PageLoader({ label = 'Loading...' }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_LOAD_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center text-sm text-slate-500">
      <Spinner className="size-8" />
      {label}
      {slow && <p className="max-w-xs text-xs text-slate-400">Still working. The server may be waking up, which can take up to a minute.</p>}
    </div>
  );
}

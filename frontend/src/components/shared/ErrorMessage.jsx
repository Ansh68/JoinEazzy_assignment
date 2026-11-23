import { Button } from '../ui';

// Shown when a page fails to load, with a retry button.
export function ErrorMessage({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
      <p className="text-sm font-medium text-red-800">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

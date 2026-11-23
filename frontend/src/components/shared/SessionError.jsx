import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui';

// Shown instead of the app when a saved login couldn't be checked because the server was unreachable.
export function SessionError() {
  const { restoreError, retryRestore, logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div role="alert" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Can&apos;t reach the server</h1>
        <p className="mt-2 text-sm text-slate-600">{restoreError}</p>
        <p className="mt-1 text-xs text-slate-400">If the server was idle it can take up to a minute to wake up.</p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={retryRestore}>Try again</Button>
          <Button variant="secondary" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}

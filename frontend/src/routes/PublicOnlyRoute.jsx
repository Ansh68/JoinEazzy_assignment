import { Navigate, Outlet } from 'react-router-dom';
import { SessionError } from '../components/shared/SessionError';
import { PageLoader } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { HOME_PATHS } from '../utils/constants';

// Login and register pages: logged-in users are sent straight to their dashboard.
export function PublicOnlyRoute() {
  const { user, loading, restoreError } = useAuth();

  if (loading) return <PageLoader label="Checking your session..." />;
  if (restoreError) return <SessionError />;
  if (user) return <Navigate to={HOME_PATHS[user.role]} replace />;

  return <Outlet />;
}

import { Navigate, Outlet } from 'react-router-dom';
import { PageLoader } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { HOME_PATHS } from '../utils/constants';

// Login and register pages: logged-in users are sent straight to their dashboard.
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader label="Checking your session..." />;
  if (user) return <Navigate to={HOME_PATHS[user.role]} replace />;

  return <Outlet />;
}

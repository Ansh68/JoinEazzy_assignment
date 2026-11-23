import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HOME_PATHS } from '../utils/constants';

// Renders its child routes only for the given role. Anyone else goes back to their own dashboard.
export function RoleRoute({ role }) {
  const { user } = useAuth();

  if (user.role !== role) return <Navigate to={HOME_PATHS[user.role]} replace />;

  return <Outlet />;
}

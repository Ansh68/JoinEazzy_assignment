import { Navigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { SessionError } from '../components/shared/SessionError';
import { PageLoader } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

// Only logged-in users get through; everyone else is sent to the login page.
export function ProtectedRoute() {
  const { user, loading, restoreError } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session..." />;
  if (restoreError) return <SessionError />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <DashboardLayout />;
}

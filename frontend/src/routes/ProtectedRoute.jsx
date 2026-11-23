import { Navigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PageLoader } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

// Only logged-in users get through; everyone else is sent to the login page.
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <DashboardLayout />;
}

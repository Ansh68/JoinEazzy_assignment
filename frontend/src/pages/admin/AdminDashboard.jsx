import { EmptyState } from '../../components/ui';
import { PageHeader } from '../../components/shared/PageHeader';
import { useAuth } from '../../hooks/useAuth';

export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title={`Welcome, ${user.name}`} description="Submission progress across all groups." />
      <EmptyState title="Dashboard coming next" description="Summary cards and charts are built in Phase 8." />
    </>
  );
}

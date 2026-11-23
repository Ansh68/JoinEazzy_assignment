import { EmptyState } from '../../components/ui';
import { PageHeader } from '../../components/shared/PageHeader';
import { useAuth } from '../../hooks/useAuth';

export function StudentDashboard() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title={`Hi, ${user.name.split(' ')[0]}`} description="Your group's progress and upcoming deadlines." />
      <EmptyState title="Dashboard coming next" description="Group progress, stats and deadlines are built in Phase 7." />
    </>
  );
}

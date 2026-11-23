import { EmptyState } from '../../components/ui';
import { PageHeader } from '../../components/shared/PageHeader';

export function ManageAssignments() {
  return (
    <>
      <PageHeader title="Assignments" description="Create, edit and track assignments." />
      <EmptyState title="Assignment management coming next" description="Create, edit and tracking views are built in Phase 8." />
    </>
  );
}

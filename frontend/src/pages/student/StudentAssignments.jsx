import { EmptyState } from '../../components/ui';
import { PageHeader } from '../../components/shared/PageHeader';

export function StudentAssignments() {
  return (
    <>
      <PageHeader title="Assignments" description="Open the OneDrive link, then confirm once your group has submitted." />
      <EmptyState title="Assignments coming next" description="The assignment list and two-step confirmation are built in Phase 7." />
    </>
  );
}

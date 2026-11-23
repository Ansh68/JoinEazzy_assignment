import { EmptyState } from '../../components/ui';
import { PageHeader } from '../../components/shared/PageHeader';

export function Analytics() {
  return (
    <>
      <PageHeader title="Analytics" description="Submission completion and group performance." />
      <EmptyState title="Charts coming next" description="Completion charts are built in Phase 8." />
    </>
  );
}

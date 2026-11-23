import { EmptyState } from '../../components/ui';
import { PageHeader } from '../../components/shared/PageHeader';

export function GroupsOverview() {
  return (
    <>
      <PageHeader title="Groups" description="Every group, its members and completion rate." />
      <EmptyState title="Groups overview coming next" description="The group list is built in Phase 8." />
    </>
  );
}

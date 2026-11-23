import { EmptyState } from '../../components/ui';
import { PageHeader } from '../../components/shared/PageHeader';

export function MyGroup() {
  return (
    <>
      <PageHeader title="My Group" description="Create a group and add your teammates." />
      <EmptyState title="Group management coming next" description="Creating a group and adding members is built in Phase 7." />
    </>
  );
}

import { getGroupAnalytics } from '../../api/analytics.api';
import { getAllGroups } from '../../api/groups.api';
import { ErrorMessage } from '../../components/shared/ErrorMessage';
import { PageHeader } from '../../components/shared/PageHeader';
import { Badge, Card, EmptyState, PageLoader, ProgressBar } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';

// Merges each group's members with its completion numbers, best performing group first.
const loadGroups = async () => {
  const [groups, stats] = await Promise.all([getAllGroups(), getGroupAnalytics()]);
  const statsById = new Map(stats.map((stat) => [stat.id, stat]));
  return stats
    .map((stat) => ({ ...groups.find((group) => group.id === stat.id), stats: statsById.get(stat.id) }))
    .filter((group) => group.id);
};

export function GroupsOverview() {
  const { data: groups, loading, error, reload } = useFetch(loadGroups);

  const header = <PageHeader title="Groups" description="Every group, its members and completion rate." />;

  if (loading) return <PageLoader />;
  if (error && !groups) {
    return (
      <>
        {header}
        <ErrorMessage message={error} onRetry={reload} />
      </>
    );
  }

  if (groups.length === 0) {
    return (
      <>
        {header}
        <EmptyState title="No groups yet" description="Groups appear here as soon as students create them." />
      </>
    );
  }

  return (
    <>
      {header}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map(({ id, name, members, stats }) => (
          <Card key={id} className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">{name}</h2>
                <p className="text-sm text-slate-500">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </p>
              </div>
              {stats.overdue > 0 && <Badge variant="danger">{stats.overdue} overdue</Badge>}
            </div>

            <ProgressBar value={stats.completionRate} label={`${stats.submitted}/${stats.assigned} assignments submitted`} />

            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {members.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-900">{member.name}</p>
                    <p className="truncate text-xs text-slate-500">{member.studentId}</p>
                  </div>
                  {member.role === 'leader' && <Badge variant="info">Leader</Badge>}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}

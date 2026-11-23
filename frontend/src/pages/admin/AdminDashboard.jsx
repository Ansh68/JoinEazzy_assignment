import { Link } from 'react-router-dom';
import { getAssignmentAnalytics, getGroupAnalytics, getOverview } from '../../api/analytics.api';
import { CompletionBarChart } from '../../components/charts';
import { ChartCard } from '../../components/shared/ChartCard';
import { ErrorMessage } from '../../components/shared/ErrorMessage';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { Card, EmptyState, PageLoader, ProgressBar, buttonClasses } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { formatDateTime } from '../../utils/date';

const LIST_LIMIT = 5;

const loadDashboard = async () => {
  const [overview, assignments, groups] = await Promise.all([getOverview(), getAssignmentAnalytics(), getGroupAnalytics()]);
  return { overview, assignments, groups };
};

export function AdminDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(loadDashboard);

  const header = <PageHeader title={`Welcome, ${user.name}`} description="Submission progress across all groups." />;

  if (loading) return <PageLoader />;
  if (error && !data) {
    return (
      <>
        {header}
        <ErrorMessage message={error} onRetry={reload} />
      </>
    );
  }

  const { overview, assignments, groups } = data;

  if (overview.totalAssignments === 0) {
    return (
      <>
        {header}
        <EmptyState
          title="No assignments yet"
          description="Create your first assignment and share the OneDrive submission link with students."
          action={
            <Link to="/admin/assignments/new" className={buttonClasses()}>
              Create assignment
            </Link>
          }
        />
      </>
    );
  }

  // Assignments that still wait on groups, soonest deadline first.
  const needsAttention = assignments.filter((a) => a.pendingGroups > 0).slice(0, LIST_LIMIT);
  const chartData = assignments.map((a) => ({
    name: a.title,
    completionRate: a.completionRate,
    detail: `${a.submittedGroups}/${a.targetedGroups} groups`,
  }));

  return (
    <>
      {header}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Students" value={overview.totalStudents} />
        <StatCard label="Groups" value={overview.totalGroups} />
        <StatCard label="Assignments" value={overview.totalAssignments} />
        <StatCard label="Overall completion" value={`${overview.completionRate}%`} tone="success" />
        <StatCard label="Pending submissions" value={overview.pendingSubmissions} tone="warning" />
        <StatCard label="Students without group" value={overview.studentsWithoutGroup} tone={overview.studentsWithoutGroup > 0 ? 'danger' : 'default'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Completion by assignment" description="Share of targeted groups that confirmed their submission.">
          <CompletionBarChart data={chartData} />
        </ChartCard>

        <div className="space-y-6">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Needs attention</h2>
              <Link to="/admin/assignments" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                All assignments
              </Link>
            </div>
            {needsAttention.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">Every group has submitted every assignment.</p>
            ) : (
              <ul className="space-y-4">
                {needsAttention.map((assignment) => (
                  <li key={assignment.id}>
                    <Link to={`/admin/assignments/${assignment.id}`} className="block rounded-lg hover:bg-slate-50">
                      <p className="text-sm font-medium text-slate-900">{assignment.title}</p>
                      <p className="mb-1.5 text-xs text-slate-500">
                        Due {formatDateTime(assignment.dueDate)} · {assignment.pendingGroups} {assignment.pendingGroups === 1 ? 'group' : 'groups'} pending
                      </p>
                      <ProgressBar value={assignment.completionRate} label="Completion" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Top groups</h2>
              <Link to="/admin/groups" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                All groups
              </Link>
            </div>
            {groups.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">No groups have been created yet.</p>
            ) : (
              <ul className="space-y-4">
                {groups.slice(0, LIST_LIMIT).map((group) => (
                  <li key={group.id}>
                    <ProgressBar value={group.completionRate} label={`${group.name} (${group.submitted}/${group.assigned})`} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

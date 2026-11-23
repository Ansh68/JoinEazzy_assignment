import { Link } from 'react-router-dom';
import { getAssignments } from '../../api/assignments.api';
import { getMyProgress } from '../../api/analytics.api';
import { ErrorMessage } from '../../components/shared/ErrorMessage';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Card, EmptyState, PageLoader, ProgressBar, buttonClasses } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { formatDateTime, getDueLabel } from '../../utils/date';

const UPCOMING_LIMIT = 5;

const loadDashboard = async () => {
  const [progress, assignments] = await Promise.all([getMyProgress(), getAssignments()]);
  return { progress, assignments };
};

export function StudentDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(loadDashboard);

  const header = <PageHeader title={`Hi, ${user.name.split(' ')[0]}`} description="Your group's progress and upcoming deadlines." />;

  if (loading) return <PageLoader />;
  if (error && !data) {
    return (
      <>
        {header}
        <ErrorMessage message={error} onRetry={reload} />
      </>
    );
  }

  const { progress, assignments } = data;

  if (!progress.group) {
    return (
      <>
        {header}
        <EmptyState
          title="Create or join a group to get started"
          description="Assignments are submitted by groups. Create your group and add your teammates."
          action={
            <Link to="/student/group" className={buttonClasses()}>
              Go to My Group
            </Link>
          }
        />
      </>
    );
  }

  // Unsubmitted work, soonest deadline first (the API already sorts by due date).
  const upcoming = assignments.filter((a) => a.status !== 'submitted').slice(0, UPCOMING_LIMIT);

  return (
    <>
      {header}

      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Your group</p>
            <p className="text-lg font-semibold text-slate-900">{progress.group.name}</p>
          </div>
          <Link to="/student/group" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            Manage group
          </Link>
        </div>
        <ProgressBar value={progress.completionRate} label="Submission progress" />
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Assignments" value={progress.total} />
        <StatCard label="Submitted" value={progress.submitted} tone="success" />
        <StatCard label="Pending" value={progress.pending} tone="warning" />
        <StatCard label="Overdue" value={progress.overdue} tone="danger" />
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Upcoming deadlines</h2>
          <Link to="/student/assignments" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">You are all caught up. Nothing is waiting for a submission.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcoming.map((assignment) => (
              <li key={assignment.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{assignment.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(assignment.dueDate)} · {getDueLabel(assignment.dueDate)}
                  </p>
                </div>
                <StatusBadge status={assignment.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

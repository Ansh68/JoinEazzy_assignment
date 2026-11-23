import { getAssignmentAnalytics, getGroupAnalytics, getOverview } from '../../api/analytics.api';
import { CompletionBarChart, SubmissionDonut } from '../../components/charts';
import { ChartCard } from '../../components/shared/ChartCard';
import { ErrorMessage } from '../../components/shared/ErrorMessage';
import { PageHeader } from '../../components/shared/PageHeader';
import { EmptyState, PageLoader } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';

const loadAnalytics = async () => {
  const [overview, assignments, groups] = await Promise.all([getOverview(), getAssignmentAnalytics(), getGroupAnalytics()]);
  return { overview, assignments, groups };
};

export function Analytics() {
  const { data, loading, error, reload } = useFetch(loadAnalytics);

  const header = <PageHeader title="Analytics" description="Submission completion and group performance." />;

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

  if (overview.totalAssignments === 0 || overview.totalGroups === 0) {
    return (
      <>
        {header}
        <EmptyState
          title="Not enough data yet"
          description="Charts appear once there is at least one assignment and one group."
        />
      </>
    );
  }

  const assignmentData = assignments.map((a) => ({
    name: a.title,
    completionRate: a.completionRate,
    detail: `${a.submittedGroups}/${a.targetedGroups} groups`,
  }));
  const groupData = groups.map((g) => ({
    name: g.name,
    completionRate: g.completionRate,
    detail: `${g.submitted}/${g.assigned} assignments, ${g.overdue} overdue`,
  }));

  return (
    <>
      {header}

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Overall completion" description="Confirmed vs pending submissions across all groups.">
          <SubmissionDonut confirmed={overview.confirmedSubmissions} pending={overview.pendingSubmissions} />
        </ChartCard>

        <ChartCard title="Group performance" description="Groups ranked by completion rate." className="lg:col-span-2">
          <CompletionBarChart data={groupData} />
        </ChartCard>

        <ChartCard title="Completion by assignment" description="Share of targeted groups that confirmed." className="lg:col-span-3">
          <CompletionBarChart data={assignmentData} />
        </ChartCard>
      </div>
    </>
  );
}

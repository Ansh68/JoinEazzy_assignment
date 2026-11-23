import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAssignmentSubmissions } from '../../api/assignments.api';
import { ErrorMessage } from '../../components/shared/ErrorMessage';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Badge, Card, EmptyState, PageLoader, ProgressBar, buttonClasses } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { cn } from '../../utils/cn';
import { formatDateTime } from '../../utils/date';

const TABS = [
  { value: 'groups', label: 'Group-wise' },
  { value: 'students', label: 'Student-wise' },
];

function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-xl text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function AssignmentDetail() {
  const { id } = useParams();
  const loadSubmissions = useCallback(() => getAssignmentSubmissions(id), [id]);
  const { data, loading, error, reload } = useFetch(loadSubmissions, `assignment-tracking-${id}`);
  const [tab, setTab] = useState('groups');

  const backLink = (
    <Link to="/admin/assignments" className="mb-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
      &larr; All assignments
    </Link>
  );

  if (loading) return <PageLoader />;
  if (error && !data) {
    return (
      <>
        {backLink}
        <ErrorMessage message={error} onRetry={reload} />
      </>
    );
  }

  const { assignment, summary, groups, students } = data;

  return (
    <>
      {backLink}
      <PageHeader
        title={assignment.title}
        description={`Due ${formatDateTime(assignment.dueDate)}`}
        action={
          <div className="flex gap-2">
            <a href={assignment.onedriveLink} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: 'secondary' })}>
              OneDrive link
            </a>
            <Link to={`/admin/assignments/${assignment.id}/edit`} className={buttonClasses()}>
              Edit
            </Link>
          </div>
        }
      />

      {assignment.description && <p className="-mt-3 mb-6 max-w-3xl text-sm text-slate-600">{assignment.description}</p>}

      <Card className="mb-6">
        <ProgressBar value={summary.completionRate} label="Groups that confirmed submission" />
      </Card>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Groups assigned" value={summary.targetedGroups} />
        <StatCard label="Submitted" value={summary.submittedGroups} tone="success" />
        <StatCard label="Pending" value={summary.pendingGroups} tone="warning" />
      </div>

      <div className="mb-4 flex gap-2" role="tablist" aria-label="Tracking view">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              tab === value ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50',
            )}
          >
            {label} ({value === 'groups' ? groups.length : students.length})
          </button>
        ))}
      </div>

      {tab === 'groups' &&
        (groups.length === 0 ? (
          <EmptyState title="No groups to track" description="No groups are assigned to this assignment yet." />
        ) : (
          <Table columns={['Group', 'Members', 'Status', 'Confirmed by', 'Confirmed at']}>
            {groups.map((group) => (
              <tr key={group.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{group.name}</td>
                <td className="px-4 py-3 text-slate-600">{group.memberCount}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={group.status} />
                </td>
                <td className="px-4 py-3 text-slate-600">{group.confirmedBy?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{group.confirmedAt ? formatDateTime(group.confirmedAt) : '—'}</td>
              </tr>
            ))}
          </Table>
        ))}

      {tab === 'students' &&
        (students.length === 0 ? (
          <EmptyState title="No students to track" description="Students appear here once they are in an assigned group." />
        ) : (
          <Table columns={['Student', 'Student ID', 'Group', 'Status', 'Confirmed submission']}>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{student.name}</p>
                  <p className="text-xs text-slate-500">{student.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{student.studentId}</td>
                <td className="px-4 py-3 text-slate-600">{student.group?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={student.status} />
                </td>
                <td className="px-4 py-3">{student.confirmedByThisStudent ? <Badge variant="success">Clicked confirm</Badge> : <span className="text-slate-400">—</span>}</td>
              </tr>
            ))}
          </Table>
        ))}
    </>
  );
}

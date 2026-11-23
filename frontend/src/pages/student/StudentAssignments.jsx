import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssignments } from '../../api/assignments.api';
import { getMyGroup } from '../../api/groups.api';
import { AssignmentCard } from '../../components/shared/AssignmentCard';
import { ConfirmSubmissionModal } from '../../components/shared/ConfirmSubmissionModal';
import { ErrorMessage } from '../../components/shared/ErrorMessage';
import { PageHeader } from '../../components/shared/PageHeader';
import { EmptyState, PageLoader } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { cn } from '../../utils/cn';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'submitted', label: 'Submitted' },
];

const loadAssignmentsPage = async () => {
  const [assignments, group] = await Promise.all([getAssignments(), getMyGroup()]);
  return { assignments, group };
};

export function StudentAssignments() {
  const { data, loading, error, reload } = useFetch(loadAssignmentsPage);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  if (loading) return <PageLoader />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  const { assignments, group } = data;
  const countFor = (value) => (value === 'all' ? assignments.length : assignments.filter((a) => a.status === value).length);
  const visible = filter === 'all' ? assignments : assignments.filter((a) => a.status === filter);

  const handleConfirmed = () => {
    setSelected(null);
    reload();
  };

  return (
    <>
      <PageHeader title="Assignments" description="Open the OneDrive link, then confirm once your group has submitted." />

      {!group && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          You need a group before you can confirm a submission.{' '}
          <Link to="/student/group" className="font-semibold underline">
            Create or join a group
          </Link>
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter assignments">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              filter === value ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50',
            )}
          >
            {label} <span className="opacity-70">({countFor(value)})</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={assignments.length === 0 ? 'No assignments yet' : `No ${filter} assignments`}
          description={assignments.length === 0 ? 'Assignments posted by your professor will show up here.' : 'Try another filter.'}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} canConfirm={Boolean(group)} onConfirm={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <ConfirmSubmissionModal
          key={selected.id}
          assignment={selected}
          groupName={group?.name}
          onClose={() => setSelected(null)}
          onConfirmed={handleConfirmed}
        />
      )}
    </>
  );
}

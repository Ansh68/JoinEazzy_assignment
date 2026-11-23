import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { deleteAssignment, getAssignments } from '../../api/assignments.api';
import { getAssignmentAnalytics } from '../../api/analytics.api';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ErrorMessage } from '../../components/shared/ErrorMessage';
import { PageHeader } from '../../components/shared/PageHeader';
import { Badge, Card, EmptyState, PageLoader, ProgressBar, buttonClasses } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { formatDateTime } from '../../utils/date';
import { getErrorMessage } from '../../utils/errors';

// Combines each assignment with its completion numbers from the analytics endpoint.
const loadAssignments = async () => {
  const [assignments, stats] = await Promise.all([getAssignments(), getAssignmentAnalytics()]);
  const statsById = new Map(stats.map((stat) => [stat.id, stat]));
  return assignments.map((assignment) => ({ ...assignment, stats: statsById.get(assignment.id) }));
};

const getAudience = ({ targetType, targets }) =>
  targetType === 'all' ? 'All students' : `${targets.length} ${targets.length === 1 ? 'group' : 'groups'}`;

export function ManageAssignments() {
  const { data: assignments, loading, error, reload } = useFetch(loadAssignments);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const createButton = (
    <Link to="/admin/assignments/new" className={buttonClasses()}>
      New assignment
    </Link>
  );
  const header = <PageHeader title="Assignments" description="Create, edit and track assignments." action={createButton} />;

  if (loading) return <PageLoader />;
  if (error && !assignments) {
    return (
      <>
        {header}
        <ErrorMessage message={error} onRetry={reload} />
      </>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAssignment(toDelete.id);
      toast.success('Assignment deleted');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <>
      {header}

      {assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Create an assignment with a OneDrive link and choose who it is for."
          action={createButton}
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const { id, title, dueDate, stats } = assignment;
            const isPastDue = new Date(dueDate) < new Date();

            return (
              <Card key={id} className="grid gap-4 md:grid-cols-[1fr_14rem_auto] md:items-center">
                <div className="min-w-0">
                  <Link to={`/admin/assignments/${id}`} className="font-semibold text-slate-900 hover:text-brand-700">
                    {title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                    <span>
                      Due {formatDateTime(dueDate)}
                    </span>
                    <Badge variant={isPastDue ? 'danger' : 'info'}>{isPastDue ? 'Past due' : 'Open'}</Badge>
                    <Badge>{getAudience(assignment)}</Badge>
                  </div>
                </div>

                <div>
                  <ProgressBar value={stats?.completionRate ?? 0} label={`${stats?.submittedGroups ?? 0}/${stats?.targetedGroups ?? 0} groups`} />
                </div>

                <div className="flex gap-2">
                  <Link to={`/admin/assignments/${id}`} className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
                    Track
                  </Link>
                  <Link to={`/admin/assignments/${id}/edit`} className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setToDelete(assignment)}
                    className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'text-red-600 hover:bg-red-50' })}
                  >
                    Delete
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete assignment?"
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      >
        <strong>{toDelete?.title}</strong> and every group&apos;s submission confirmation for it will be permanently deleted.
      </ConfirmDialog>
    </>
  );
}

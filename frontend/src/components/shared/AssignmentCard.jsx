import { formatDateTime, getDueLabel } from '../../utils/date';
import { cn } from '../../utils/cn';
import { Button, Card, buttonClasses } from '../ui';
import { StatusBadge } from './StatusBadge';

// One assignment as a student sees it: details, OneDrive link and the submission button.
export function AssignmentCard({ assignment, canConfirm, onConfirm }) {
  const { title, description, dueDate, onedriveLink, status, submission } = assignment;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <StatusBadge status={status} />
      </div>

      <p className="line-clamp-3 text-sm text-slate-600">{description || 'No description provided.'}</p>

      <div className="text-sm">
        <p className="text-slate-700">Due {formatDateTime(dueDate)}</p>
        {status !== 'submitted' && (
          <p className={cn('mt-0.5 font-medium', status === 'overdue' ? 'text-red-600' : 'text-slate-500')}>
            {getDueLabel(dueDate)}
          </p>
        )}
      </div>

      {submission && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Confirmed by {submission.confirmedBy.name} on {formatDateTime(submission.confirmedAt)}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2">
        <a href={onedriveLink} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
          Open OneDrive link
        </a>
        {status !== 'submitted' && (
          <Button size="sm" disabled={!canConfirm} onClick={() => onConfirm(assignment)}>
            I have submitted
          </Button>
        )}
      </div>
    </Card>
  );
}

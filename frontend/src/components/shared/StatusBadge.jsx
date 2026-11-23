import { Badge } from '../ui';

const STATUSES = {
  submitted: { variant: 'success', label: 'Submitted' },
  pending: { variant: 'warning', label: 'Pending' },
  overdue: { variant: 'danger', label: 'Overdue' },
  no_group: { variant: 'neutral', label: 'No group' },
};

// Shows an assignment status returned by the API (submitted, pending, overdue or no_group).
export function StatusBadge({ status }) {
  const { variant, label } = STATUSES[status] ?? STATUSES.pending;
  return <Badge variant={variant}>{label}</Badge>;
}

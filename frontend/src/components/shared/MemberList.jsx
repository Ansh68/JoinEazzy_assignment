import { Badge, Button } from '../ui';

// Members of a group. The leader gets a "Remove" button next to everyone else.
export function MemberList({ members, currentUserId, canRemove, onRemove, removingId }) {
  return (
    <ul className="divide-y divide-slate-100">
      {members.map((member) => (
        <li key={member.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {member.name}
              {member.id === currentUserId && <span className="ml-1.5 text-slate-400">(you)</span>}
            </p>
            <p className="truncate text-xs text-slate-500">
              {member.studentId} · {member.email}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={member.role === 'leader' ? 'info' : 'neutral'} className="capitalize">
              {member.role}
            </Badge>
            {canRemove && member.id !== currentUserId && (
              <Button variant="ghost" size="sm" loading={removingId === member.id} onClick={() => onRemove(member)}>
                Remove
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

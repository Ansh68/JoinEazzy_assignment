import { useAuth } from '../../hooks/useAuth';
import { Badge, Icon } from '../ui';

export function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenuClick} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
          <Icon name="menu" className="size-6" />
        </button>
        <span className="text-lg font-bold text-brand-700 lg:hidden">Joineazy</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{user.studentId ?? user.email}</p>
        </div>
        <Badge variant={user.role === 'admin' ? 'info' : 'neutral'} className="capitalize">
          {user.role === 'admin' ? 'Professor' : 'Student'}
        </Badge>
        <span className="flex size-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white" aria-hidden="true">
          {initials}
        </span>
      </div>
    </header>
  );
}

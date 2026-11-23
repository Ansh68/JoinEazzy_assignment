import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS } from '../../utils/constants';
import { cn } from '../../utils/cn';
import { Icon } from '../ui';

const linkClass = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  );

// Fixed on large screens; slides in over the page on small ones.
export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200',
          'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="text-lg font-bold text-brand-700">Joineazy</span>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Close menu">
            <Icon name="close" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Main">
          {NAV_ITEMS[user.role].map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon name={icon} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button type="button" onClick={logout} className={cn(linkClass({ isActive: false }), 'w-full')}>
            <Icon name="logout" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

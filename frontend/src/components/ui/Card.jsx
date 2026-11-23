import { cn } from '../../utils/cn';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-xs', className)} {...props}>
      {children}
    </div>
  );
}

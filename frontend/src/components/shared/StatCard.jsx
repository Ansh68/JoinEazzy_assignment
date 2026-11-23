import { Card } from '../ui';
import { cn } from '../../utils/cn';

const TONES = {
  default: 'text-slate-900',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
};

export function StatCard({ label, value, tone = 'default' }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={cn('mt-1 text-3xl font-semibold', TONES[tone])}>{value}</p>
    </Card>
  );
}

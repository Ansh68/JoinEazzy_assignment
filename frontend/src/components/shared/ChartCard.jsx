import { Suspense } from 'react';
import { Card, PageLoader } from '../ui';

// Card with a title around a lazily loaded chart.
export function ChartCard({ title, description, children, className }) {
  return (
    <Card className={className}>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      <div className="mt-4">
        <Suspense fallback={<PageLoader label="Loading chart..." />}>{children}</Suspense>
      </div>
    </Card>
  );
}

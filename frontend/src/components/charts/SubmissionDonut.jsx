import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = { Confirmed: '#10b981', Pending: '#e2e8f0' };

// Donut of confirmed vs pending submissions, with the overall percentage in the middle.
export default function SubmissionDonut({ confirmed, pending }) {
  const total = confirmed + pending;
  const data = [
    { name: 'Confirmed', value: confirmed },
    { name: 'Pending', value: pending },
  ];

  return (
    <div className="relative h-56" role="img" aria-label={`${confirmed} of ${total} submissions confirmed`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={total === 0 ? [{ name: 'Pending', value: 1 }] : data} dataKey="value" innerRadius={62} outerRadius={88} startAngle={90} endAngle={-270} stroke="none">
            {(total === 0 ? [{ name: 'Pending' }] : data).map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          {total > 0 && <Tooltip />}
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-slate-900">{total === 0 ? 0 : Math.round((confirmed / total) * 100)}%</span>
        <span className="text-xs text-slate-500">
          {confirmed} of {total} confirmed
        </span>
      </div>
    </div>
  );
}

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ROW_HEIGHT = 44;
const BAR_COLOR = '#4f46e5';

const truncate = (text, max = 22) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

// Horizontal bars of completion percentage (0-100), one row per item.
// Each item needs: name, completionRate and an optional `detail` line shown in the tooltip.
export default function CompletionBarChart({ data }) {
  return (
    <div role="img" aria-label="Completion percentage chart" style={{ height: data.length * ROW_HEIGHT + 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
          <CartesianGrid horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} stroke="#94a3b8" fontSize={12} />
          <YAxis type="category" dataKey="name" width={130} tickFormatter={(name) => truncate(name)} stroke="#64748b" fontSize={12} tickLine={false} />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            formatter={(value) => [`${value}%`, 'Completion']}
            labelFormatter={(label, items) => items?.[0]?.payload?.detail ? `${label} · ${items[0].payload.detail}` : label}
          />
          <Bar dataKey="completionRate" fill={BAR_COLOR} radius={[0, 4, 4, 0]} barSize={20}>
            <LabelList dataKey="completionRate" position="right" formatter={(value) => `${value}%`} fontSize={12} fill="#475569" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

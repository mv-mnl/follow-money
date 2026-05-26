import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = [
  '#3b82f6','#8b5cf6','#ec4899','#f97316','#eab308',
  '#14b8a6','#06b6d4','#84cc16','#f43f5e','#a855f7',
];

function fmt(v) {
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(v);
}

export default function CategoryBarChart({ data, type = 'expense' }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-400 py-10 text-sm">Sin datos</div>;
  }

  const chartData = data.map((row) => ({
    name: row.category,
    Total: parseFloat(row.total),
    count: row.count,
  }));

  const barColor = type === 'expense' ? '#ef4444' : '#10b981';

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 40)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `$${v}`} />
        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <Tooltip
          formatter={(val, _, { payload }) => [fmt(val), `${payload.count} mov.`]}
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#f9fafb' }}
        />
        <Bar dataKey="Total" radius={[0, 4, 4, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

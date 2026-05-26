import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function fmt(v) {
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

export default function MonthlyBarChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-400 py-10 text-sm">Sin datos</div>;
  }

  const chartData = data.map((row) => ({
    name: `${MONTH_NAMES[parseInt(row.mo) - 1]} ${String(row.yr).slice(2)}`,
    Ingresos: parseFloat(row.income),
    Gastos:   parseFloat(row.expense),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `$${v}`} />
        <Tooltip
          formatter={(val, name) => [fmt(val), name]}
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#f9fafb' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Gastos"   fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

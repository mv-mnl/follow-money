import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

function fmt(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function SummaryCards({ summary }) {
  const cards = [
    {
      label: 'Ingresos',
      value: summary.income,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Gastos',
      value: summary.expense,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Balance',
      value: summary.balance,
      icon: Wallet,
      color: summary.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400',
      bg: summary.balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className={`rounded-xl p-4 ${bg} border border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <Icon size={18} className={color} />
          </div>
          <p className={`text-2xl font-bold ${color}`}>{fmt(value)}</p>
        </div>
      ))}
    </div>
  );
}

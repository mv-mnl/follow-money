import { Trash2 } from 'lucide-react';

function fmt(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TransactionList({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center text-gray-400 dark:text-gray-500 py-12">
        Sin transacciones en este período
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div
            className={`w-2 h-10 rounded-full flex-shrink-0 ${
              t.type === 'income' ? 'bg-emerald-400' : 'bg-red-400'
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{t.category}</span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                {fmtDate(t.date)}
              </span>
            </div>
            {t.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{t.description}</p>
            )}
          </div>
          <span
            className={`font-semibold flex-shrink-0 ${
              t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
          </span>
          <button
            onClick={() => onDelete(t.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

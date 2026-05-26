import { Trash2, CreditCard, Banknote, ArrowRight } from 'lucide-react';

function fmt(n) {
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(n);
}

function fmtDate(d) {
  if (!d) return '';
  const s = typeof d === 'string' ? d.substring(0, 10) : new Date(d).toISOString().substring(0, 10);
  return new Date(s + 'T12:00:00').toLocaleDateString('es-SV', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function sourceLabel(t) {
  if (t.payment_method === 'tarjeta') return t.card_name || 'Tarjeta';
  return 'Efectivo';
}

function TransferRow({ t, onDelete }) {
  const from = sourceLabel(t);
  const to   = t.to_account === 'efectivo' ? 'Efectivo' : t.to_account;
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="w-1.5 h-10 rounded-full flex-shrink-0 bg-indigo-400" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <span className="truncate">{from}</span>
          <ArrowRight size={13} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{to}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{fmtDate(t.date)}</span>
          {t.description && <span className="text-xs text-gray-400 truncate">· {t.description}</span>}
        </div>
      </div>
      <span className="font-semibold flex-shrink-0 text-sm text-indigo-600 dark:text-indigo-400">
        {fmt(t.amount)}
      </span>
      <button
        onClick={() => onDelete(t.id)}
        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function TransactionList({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return <div className="text-center text-gray-400 dark:text-gray-500 py-12">Sin transacciones en este período</div>;
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => {
        if (t.type === 'transfer') return <TransferRow key={t.id} t={t} onDelete={onDelete} />;

        return (
          <div
            key={t.id}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium truncate">{t.category}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{fmtDate(t.date)}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {t.payment_method === 'tarjeta' ? (
                  <span className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400">
                    <CreditCard size={11} />{t.card_name || 'Tarjeta'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <Banknote size={11} />Efectivo
                  </span>
                )}
                {t.description && <span className="text-xs text-gray-400 truncate">· {t.description}</span>}
              </div>
            </div>
            <span className={`font-semibold flex-shrink-0 text-sm ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
            </span>
            <button
              onClick={() => onDelete(t.id)}
              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

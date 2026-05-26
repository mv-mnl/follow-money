import { Banknote, CreditCard } from 'lucide-react';

function fmt(n) {
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(n);
}

export default function BalanceCards({ balances }) {
  if (!balances || balances.length === 0) return null;

  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Saldos
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {balances.map(({ account, balance }) => {
          const isCash = account === 'efectivo';
          const positive = balance >= 0;
          return (
            <div
              key={account}
              className="flex items-center gap-2.5 bg-white dark:bg-gray-800 rounded-xl px-3 py-3 border border-gray-200 dark:border-gray-700"
            >
              <div className={`p-1.5 rounded-lg ${isCash ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                {isCash
                  ? <Banknote size={15} className="text-emerald-600 dark:text-emerald-400" />
                  : <CreditCard size={15} className="text-blue-600 dark:text-blue-400" />
                }
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{account}</p>
                <p className={`text-sm font-bold ${positive ? 'text-gray-900 dark:text-gray-100' : 'text-red-600 dark:text-red-400'}`}>
                  {fmt(balance)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import ThemeToggle from './components/ThemeToggle';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';

const now = new Date();

export default function App() {
  const { dark, toggle } = useTheme();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, sumRes] = await Promise.all([
        fetch(`/api/transactions?month=${month}&year=${year}`),
        fetch(`/api/transactions/summary?month=${month}&year=${year}`),
      ]);
      setTransactions(await txRes.json());
      setSummary(await sumRes.json());
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const monthLabel = new Date(year, month - 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  const handleAdd = (tx) => {
    const txDate = new Date(tx.date + 'T00:00:00');
    if (txDate.getMonth() + 1 === month && txDate.getFullYear() === year) {
      load();
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign size={22} className="text-blue-600" />
            <span className="font-bold text-lg">FollowMoney</span>
          </div>
          <ThemeToggle dark={dark} toggle={toggle} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <TransactionForm onAdd={handleAdd} />

        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-semibold capitalize">{monthLabel}</h2>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <SummaryCards summary={summary} />

        {loading ? (
          <div className="text-center text-gray-400 py-8">Cargando...</div>
        ) : (
          <TransactionList transactions={transactions} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
}

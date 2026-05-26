import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import SummaryCards from '../components/SummaryCards';
import BalanceCards from '../components/BalanceCards';
import TransactionList from '../components/TransactionList';
import { todaySV } from '../utils/date';

export default function DashboardPage() {
  const svNow = new Date(todaySV() + 'T00:00:00');
  const [year, setYear]   = useState(svNow.getFullYear());
  const [month, setMonth] = useState(svNow.getMonth() + 1);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary]   = useState({ income: 0, expense: 0, balance: 0 });
  const [balances, setBalances] = useState([]);
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, sumRes, balRes] = await Promise.all([
        fetch(`/api/transactions?month=${month}&year=${year}`),
        fetch(`/api/transactions/summary?month=${month}&year=${year}`),
        fetch('/api/balances'),
      ]);
      setTransactions(await txRes.json());
      setSummary(await sumRes.json());
      setBalances(await balRes.json());
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => month === 1 ? (setMonth(12), setYear((y) => y - 1)) : setMonth((m) => m - 1);
  const nextMonth = () => month === 12 ? (setMonth(1), setYear((y) => y + 1)) : setMonth((m) => m + 1);

  const monthLabel = new Date(year, month - 1).toLocaleDateString('es-SV', { month: 'long', year: 'numeric' });

  const handleDelete = async (id) => {
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <Layout>
      <BalanceCards balances={balances} />

      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-semibold capitalize">{monthLabel}</h2>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <SummaryCards summary={summary} />

      {loading
        ? <div className="text-center text-gray-400 py-8">Cargando...</div>
        : <TransactionList transactions={transactions} onDelete={handleDelete} />
      }
    </Layout>
  );
}

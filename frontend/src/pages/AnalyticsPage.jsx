import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import SummaryCards from '../components/SummaryCards';
import TransactionList from '../components/TransactionList';
import { todaySV } from '../utils/date';

// ─── helpers ────────────────────────────────────────────────────────────────

const MONTH_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function fmt(n) {
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(n);
}

function fmtDate(d) {
  if (!d) return '';
  const s = typeof d === 'string' ? d.substring(0, 10) : new Date(d).toISOString().substring(0, 10);
  return new Date(s + 'T12:00:00').toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function weekBounds(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const dow = d.getDay();
  const diff = dow === 0 ? 6 : dow - 1;
  const mon = new Date(d); mon.setDate(d.getDate() - diff);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return [mon.toISOString().split('T')[0], sun.toISOString().split('T')[0]];
}

function periodLabel(period, ref) {
  const d = new Date(ref + 'T12:00:00');
  if (period === 'day')   return fmtDate(ref);
  if (period === 'week')  { const [a, b] = weekBounds(ref); return `${fmtDate(a)} – ${fmtDate(b)}`; }
  if (period === 'month') return `${MONTH_ES[d.getMonth()]} ${d.getFullYear()}`;
  if (period === 'year')  return `${d.getFullYear()}`;
  return '';
}

function navigateRef(period, ref, dir) {
  if (period === 'day')   return addDays(ref, dir);
  if (period === 'week')  return addDays(ref, dir * 7);
  if (period === 'month') {
    const d = new Date(ref + 'T12:00:00');
    d.setMonth(d.getMonth() + dir);
    return d.toISOString().split('T')[0];
  }
  if (period === 'year') {
    const d = new Date(ref + 'T12:00:00');
    d.setFullYear(d.getFullYear() + dir);
    return d.toISOString().split('T')[0];
  }
  return ref;
}

// ─── Charts tab ─────────────────────────────────────────────────────────────

function ChartsView() {
  const [monthly, setMonthly] = useState([]);
  const [catData, setCatData] = useState([]);
  const [catType, setCatType] = useState('expense');
  const now = new Date(todaySV() + 'T12:00:00');
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);

  useEffect(() => {
    fetch('/api/analytics/monthly?months=6').then((r) => r.json()).then(setMonthly);
  }, []);

  useEffect(() => {
    fetch(`/api/analytics/categories?type=${catType}&period=month&year=${year}&month=${month}`)
      .then((r) => r.json()).then(setCatData);
  }, [catType, year, month]);

  return (
    <div className="space-y-5">
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold mb-3">Últimos 6 meses</h3>
        <MonthlyBarChart data={monthly} />
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Por categoría — {MONTH_ES[month - 1]}</h3>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            {['expense','income'].map((t) => (
              <button
                key={t}
                onClick={() => setCatType(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  catType === t
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {t === 'expense' ? 'Gastos' : 'Ingresos'}
              </button>
            ))}
          </div>
        </div>
        <CategoryBarChart data={catData} type={catType} />
      </section>
    </div>
  );
}

// ─── Reports tab ─────────────────────────────────────────────────────────────

const PERIODS = [
  { id: 'day',   label: 'Diario'   },
  { id: 'week',  label: 'Semanal'  },
  { id: 'month', label: 'Mensual'  },
  { id: 'year',  label: 'Anual'    },
];

function ReportsView() {
  const [period, setPeriod]   = useState('month');
  const [ref, setRef]         = useState(todaySV());
  const [groupBy, setGroupBy] = useState('category');
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const d = new Date(ref + 'T12:00:00');
    const params = new URLSearchParams({
      period,
      groupBy,
      date: ref,
      year:  d.getFullYear(),
      month: d.getMonth() + 1,
    });
    const data = await fetch(`/api/analytics/report?${params}`).then((r) => r.json());
    setRows(data);
    setLoading(false);
  }, [period, ref, groupBy]);

  useEffect(() => { load(); }, [load]);

  const nav = (dir) => setRef((r) => navigateRef(period, r, dir));

  const incomeRows  = rows.filter((r) => r.type === 'income');
  const expenseRows = rows.filter((r) => r.type === 'expense');
  const totalIncome  = incomeRows.reduce((s, r)  => s + parseFloat(r.total ?? r.amount ?? 0), 0);
  const totalExpense = expenseRows.reduce((s, r) => s + parseFloat(r.total ?? r.amount ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {PERIODS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setPeriod(id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              period === id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium capitalize">{periodLabel(period, ref)}</span>
        <button onClick={() => nav(1)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* GroupBy toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 w-fit">
        {['category','detail'].map((g) => (
          <button
            key={g}
            onClick={() => setGroupBy(g)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              groupBy === g
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {g === 'category' ? 'Por Categoría' : 'Detalle'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-8 text-sm">Cargando...</div>
      ) : rows.length === 0 ? (
        <div className="text-center text-gray-400 py-8 text-sm">Sin datos en este período</div>
      ) : groupBy === 'category' ? (
        <CategoryTableView
          incomeRows={incomeRows} expenseRows={expenseRows}
          totalIncome={totalIncome} totalExpense={totalExpense}
        />
      ) : (
        <DetailView rows={rows} />
      )}
    </div>
  );
}

function CategoryTableView({ incomeRows, expenseRows, totalIncome, totalExpense }) {
  return (
    <div className="space-y-3">
      {expenseRows.length > 0 && (
        <CategorySection title="Gastos" rows={expenseRows} total={totalExpense} color="red" />
      )}
      {incomeRows.length > 0 && (
        <CategorySection title="Ingresos" rows={incomeRows} total={totalIncome} color="emerald" />
      )}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
        <span className="text-sm font-semibold">Balance</span>
        <span className={`font-bold ${totalIncome - totalExpense >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {fmt(totalIncome - totalExpense)}
        </span>
      </div>
    </div>
  );
}

function CategorySection({ title, rows, total, color }) {
  const cls = color === 'red'
    ? 'text-red-600 dark:text-red-400'
    : 'text-emerald-600 dark:text-emerald-400';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{title}</span>
        <span className={`text-xs font-bold ${cls}`}>{fmt(total)}</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex justify-between items-center px-4 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
          <div>
            <span className="text-sm">{r.category}</span>
            <span className="text-xs text-gray-400 ml-2">{r.count} mov.</span>
          </div>
          <span className={`text-sm font-semibold ${cls}`}>{fmt(r.total)}</span>
        </div>
      ))}
    </div>
  );
}

function DetailView({ rows }) {
  return (
    <div className="space-y-1.5">
      {rows.map((t) => (
        <div key={t.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
          <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${
            t.type === 'income' ? 'bg-emerald-400' : t.type === 'transfer' ? 'bg-indigo-400' : 'bg-red-400'
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{t.category}</p>
            <p className="text-xs text-gray-400">{fmtDate(t.date)}{t.description ? ` · ${t.description}` : ''}</p>
          </div>
          <span className={`text-sm font-semibold flex-shrink-0 ${
            t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Movimientos tab ─────────────────────────────────────────────────────────

function MovimientosView() {
  const svNow = new Date(todaySV() + 'T00:00:00');
  const [year, setYear]   = useState(svNow.getFullYear());
  const [month, setMonth] = useState(svNow.getMonth() + 1);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [txRes, sumRes] = await Promise.all([
      fetch(`/api/transactions?month=${month}&year=${year}`),
      fetch(`/api/transactions/summary?month=${month}&year=${year}`),
    ]);
    setTransactions(await txRes.json());
    setSummary(await sumRes.json());
    setLoading(false);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold capitalize">{monthLabel}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>
      <SummaryCards summary={summary} />
      {loading
        ? <div className="text-center text-gray-400 py-8 text-sm">Cargando...</div>
        : <TransactionList transactions={transactions} onDelete={handleDelete} />
      }
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'movimientos', label: 'Movimientos' },
  { id: 'charts',      label: 'Gráficos'    },
  { id: 'reports',     label: 'Reportes'    },
];

export default function AnalyticsPage() {
  const [tab, setTab] = useState('movimientos');

  return (
    <Layout title="Análisis">
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'movimientos' && <MovimientosView />}
      {tab === 'charts'      && <ChartsView />}
      {tab === 'reports'     && <ReportsView />}
    </Layout>
  );
}

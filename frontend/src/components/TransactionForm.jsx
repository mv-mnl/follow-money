import { useState } from 'react';
import { Plus } from 'lucide-react';

const CATEGORIES = {
  income: ['Salario', 'Freelance', 'Inversiones', 'Venta', 'Otros ingresos'],
  expense: ['Comida', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Ropa', 'Servicios', 'Educación', 'Otros gastos'],
};

const today = () => new Date().toISOString().split('T')[0];

export default function TransactionForm({ onAdd }) {
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: CATEGORIES.expense[0],
    description: '',
    date: today(),
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) =>
    setForm((f) => ({
      ...f,
      [k]: v,
      ...(k === 'type' ? { category: CATEGORIES[v][0] } : {}),
    }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      const data = await res.json();
      onAdd(data);
      setForm((f) => ({ ...f, amount: '', description: '', date: today() }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <h2 className="text-lg font-semibold mb-4">Nueva transacción</h2>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          type="button"
          onClick={() => set('type', 'expense')}
          className={`py-2 rounded-lg font-medium transition-colors ${
            form.type === 'expense'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => set('type', 'income')}
          className={`py-2 rounded-lg font-medium transition-colors ${
            form.type === 'income'
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Ingreso
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Monto"
          value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
          required
          className="input"
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
          required
          className="input"
        />
        <select
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          className="input"
        >
          {CATEGORIES[form.type].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Descripción (opcional)"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className="input"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
      >
        <Plus size={18} />
        {loading ? 'Guardando...' : 'Agregar'}
      </button>
    </form>
  );
}

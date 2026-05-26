import { useState, useEffect } from 'react';
import { Plus, CreditCard, Banknote } from 'lucide-react';
import { todaySV } from '../utils/date';

const blank = (cats) => ({
  type: 'expense',
  amount: '',
  category: cats.expense[0] ?? '',
  description: '',
  payment_method: 'efectivo',
  card_name: '',
  date: todaySV(),
});

export default function TransactionForm({ onAdd }) {
  const [cats, setCats] = useState({ income: [], expense: [] });
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/cards').then((r) => r.json()),
    ]).then(([allCats, allCards]) => {
      const grouped = { income: [], expense: [] };
      allCats.forEach((c) => grouped[c.type]?.push(c.name));
      setCats(grouped);
      setCards(allCards);
      setForm(blank(grouped));
    });
  }, []);

  if (!form) return null;

  const set = (k, v) =>
    setForm((f) => ({
      ...f,
      [k]: v,
      ...(k === 'type' ? { category: cats[v][0] ?? '', card_name: '' } : {}),
      ...(k === 'payment_method' && v === 'efectivo' ? { card_name: '' } : {}),
    }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), date: todaySV() };
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al guardar');
      const data = await res.json();
      onAdd?.(data);
      setForm((f) => ({ ...blank(cats), type: f.type, payment_method: f.payment_method, card_name: f.card_name }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Tipo */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {['expense', 'income'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => set('type', t)}
            className={`py-2 rounded-lg font-medium text-sm transition-colors ${
              form.type === t
                ? t === 'expense' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t === 'expense' ? 'Gasto' : 'Ingreso'}
          </button>
        ))}
      </div>

      {/* Monto + Categoría */}
      <div className="grid grid-cols-2 gap-2 mb-2">
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
        <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input">
          {(cats[form.type] ?? []).map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Descripción */}
      <input
        type="text"
        placeholder="Descripción (opcional)"
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        className="input mb-2 w-full"
      />

      {/* Método de pago */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {[
          { val: 'efectivo', label: 'Efectivo', Icon: Banknote },
          { val: 'tarjeta',  label: 'Tarjeta',  Icon: CreditCard },
        ].map(({ val, label, Icon }) => (
          <button
            key={val}
            type="button"
            onClick={() => set('payment_method', val)}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.payment_method === val
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Selector de tarjeta — botones */}
      {form.payment_method === 'tarjeta' && (
        cards.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-2">
            {cards.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => set('card_name', c.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  form.card_name === c.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <CreditCard size={13} />
                {c.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
            Sin tarjetas. Ve a <a href="/config" className="underline">Configuración</a> para agregar.
          </p>
        )
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
      >
        <Plus size={18} />
        {loading ? 'Guardando...' : 'Agregar'}
      </button>
    </form>
  );
}

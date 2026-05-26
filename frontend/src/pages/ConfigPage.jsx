import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import Layout from '../components/Layout';

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function AddRow({ placeholder, onAdd }) {
  const [val, setVal] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal('');
  };
  return (
    <form onSubmit={submit} className="flex gap-2 mt-3">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        className="input flex-1"
      />
      <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
        <Plus size={16} />
      </button>
    </form>
  );
}

function ItemList({ items, onDelete }) {
  if (items.length === 0) return <p className="text-sm text-gray-400">Ninguno</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between">
          <span className="text-sm">{item.name}</span>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function ConfigPage() {
  const [cats, setCats]   = useState({ income: [], expense: [] });
  const [cards, setCards] = useState([]);

  const loadAll = () =>
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/cards').then((r) => r.json()),
    ]).then(([allCats, allCards]) => {
      const grouped = { income: [], expense: [] };
      allCats.forEach((c) => grouped[c.type]?.push(c));
      setCats(grouped);
      setCards(allCards);
    });

  useEffect(() => { loadAll(); }, []);

  const addCat = (type) => async (name) => {
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type }),
    });
    loadAll();
  };

  const delCat = async (id) => {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    loadAll();
  };

  const addCard = async (name) => {
    await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    loadAll();
  };

  const delCard = async (id) => {
    await fetch(`/api/cards/${id}`, { method: 'DELETE' });
    loadAll();
  };

  return (
    <Layout title="Configuración">
      <Section title="Tarjetas">
        <ItemList items={cards} onDelete={delCard} />
        <AddRow placeholder="Nombre de tarjeta (ej. Visa Davivienda)" onAdd={addCard} />
      </Section>

      <Section title="Categorías — Gastos">
        <ItemList items={cats.expense} onDelete={delCat} />
        <AddRow placeholder="Nueva categoría de gasto" onAdd={addCat('expense')} />
      </Section>

      <Section title="Categorías — Ingresos">
        <ItemList items={cats.income} onDelete={delCat} />
        <AddRow placeholder="Nueva categoría de ingreso" onAdd={addCat('income')} />
      </Section>
    </Layout>
  );
}

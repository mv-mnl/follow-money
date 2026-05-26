import { useState, useEffect } from 'react';
import { ArrowRight, Banknote, CreditCard } from 'lucide-react';
import { todaySV } from '../utils/date';

function AccountButton({ name, selected, onClick }) {
  const isCash = name === 'efectivo';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        selected
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {isCash ? <Banknote size={13} /> : <CreditCard size={13} />}
      {isCash ? 'Efectivo' : name}
    </button>
  );
}

export default function TransferForm({ onDone }) {
  const [cards, setCards]   = useState([]);
  const [from, setFrom]     = useState('');
  const [to, setTo]         = useState('efectivo');
  const [amount, setAmount] = useState('');
  const [desc, setDesc]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/cards').then((r) => r.json()).then((c) => {
      setCards(c);
      // Default: primera tarjeta → efectivo (flujo más común: retirar)
      setFrom(c.length > 0 ? c[0].name : 'efectivo');
      setTo('efectivo');
    });
  }, []);

  const accounts = ['efectivo', ...cards.map((c) => c.name)];
  const toOptions = accounts.filter((a) => a !== from);

  const setFromSafe = (val) => {
    setFrom(val);
    // Card → default to cash; cash → default to first card
    setTo(val === 'efectivo' ? (cards[0]?.name ?? '') : 'efectivo');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !to) return;
    setLoading(true);
    try {
      const fromMethod = from === 'efectivo' ? 'efectivo' : 'tarjeta';
      const fromCard   = from === 'efectivo' ? null : from;
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transfer',
          amount: parseFloat(amount),
          payment_method: fromMethod,
          card_name: fromCard,
          to_account: to,
          description: desc,
          date: todaySV(),
        }),
      });
      setAmount('');
      setDesc('');
      onDone?.();
    } finally {
      setLoading(false);
    }
  };

  if (accounts.length < 2) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
        Agrega tarjetas en <a href="/config" className="underline text-blue-500">Configuración</a> para transferir.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {/* Desde */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Desde</p>
        <div className="flex flex-wrap gap-2">
          {accounts.map((a) => (
            <AccountButton key={a} name={a} selected={from === a} onClick={() => setFromSafe(a)} />
          ))}
        </div>
      </div>

      {/* Flecha + Hacia */}
      <div className="flex items-center gap-2 text-gray-400">
        <ArrowRight size={16} />
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Hacia</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {toOptions.map((a) => (
          <AccountButton key={a} name={a} selected={to === a} onClick={() => setTo(a)} />
        ))}
      </div>

      {/* Monto */}
      <input
        type="number"
        step="0.01"
        min="0.01"
        placeholder="Monto"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="input w-full"
      />

      <input
        type="text"
        placeholder="Descripción (opcional)"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="input w-full"
      />

      <button
        type="submit"
        disabled={loading || !to}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
      >
        <ArrowRight size={17} />
        {loading ? 'Transfiriendo...' : 'Transferir'}
      </button>
    </form>
  );
}

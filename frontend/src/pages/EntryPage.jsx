import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import TransactionForm from '../components/TransactionForm';
import TransferForm from '../components/TransferForm';
import { nowSV } from '../utils/date';

const TABS = [
  { id: 'entry',    label: 'Ingresar' },
  { id: 'transfer', label: 'Transferir' },
];

export default function EntryPage() {
  const [tab, setTab] = useState('entry');
  const [success, setSuccess] = useState(false);
  const [clock, setClock] = useState(nowSV());

  useEffect(() => {
    const t = setInterval(() => setClock(nowSV()), 30000);
    return () => clearInterval(t);
  }, []);

  const handleDone = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Layout title="Ingresar">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 capitalize">{clock}</p>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSuccess(false); }}
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

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-xl px-4 py-3 mb-4">
          <CheckCircle size={17} />
          <span className="font-medium">
            {tab === 'transfer' ? 'Transferencia realizada' : 'Guardado correctamente'}
          </span>
        </div>
      )}

      {tab === 'entry'
        ? <TransactionForm onAdd={handleDone} />
        : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <TransferForm onDone={handleDone} />
          </div>
        )
      }
    </Layout>
  );
}

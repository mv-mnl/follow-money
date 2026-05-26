import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import BalanceCards from '../components/BalanceCards';

export default function DashboardPage() {
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    fetch('/api/balances').then((r) => r.json()).then(setBalances);
  }, []);

  return (
    <Layout>
      <BalanceCards balances={balances} />
    </Layout>
  );
}

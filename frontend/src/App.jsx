import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage  from './pages/DashboardPage';
import EntryPage      from './pages/EntryPage';
import ConfigPage     from './pages/ConfigPage';
import AnalyticsPage  from './pages/AnalyticsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<DashboardPage />} />
      <Route path="/ingresar" element={<EntryPage />} />
      <Route path="/analisis" element={<AnalyticsPage />} />
      <Route path="/config"   element={<ConfigPage />} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  );
}

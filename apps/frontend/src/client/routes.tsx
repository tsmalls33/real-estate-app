import { Route, Routes } from 'react-router-dom';
import ClientShell from './layout/ClientShell';
import Dashboard from './pages/Dashboard';
import Reservations from './pages/Reservations';
import Income from './pages/Income';
import Settings from './pages/Settings';

export default function ClientRoutes() {
  return (
    <Routes>
      <Route element={<ClientShell />}>
        <Route index element={<Dashboard />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="income" element={<Income />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

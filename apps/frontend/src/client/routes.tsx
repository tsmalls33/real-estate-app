import { Route, Routes } from 'react-router-dom';
import ClientShell from './layout/ClientShell';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

export default function ClientRoutes() {
  return (
    <Routes>
      <Route element={<ClientShell />}>
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

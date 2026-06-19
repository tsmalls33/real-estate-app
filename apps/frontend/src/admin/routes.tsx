import { Route, Routes } from 'react-router-dom';
import AdminShell from './layout/AdminShell';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Tenants from './pages/Tenants';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="tenants" element={<Tenants />} />
      </Route>
    </Routes>
  );
}

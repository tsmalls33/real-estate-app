import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { UserRoles } from '@RealEstate/types';
import ErrorBoundary from '../shared/components/ErrorBoundary/ErrorBoundary';
import ErrorPanel from '../shared/components/ErrorPanel/ErrorPanel';
import { ProtectedRoute } from '../shared/auth/ProtectedRoute';
import { useSession } from '../shared/theme/ThemeContext';
import { getAccessToken, getRole, landingForRole } from '../shared/auth/tokens';
import Login from './auth/Login';
import Signup from './auth/Signup';

const AdminRoutes = lazy(() => import('../admin/routes'));
const ClientRoutes = lazy(() => import('../client/routes'));

function HomeRedirect() {
  if (!getAccessToken()) return <Navigate to="/signin" replace />;
  const role = getRole();
  if (!role) return <Navigate to="/signin" replace />;
  return <Navigate to={landingForRole(role)} replace />;
}

function PublicOnly({ children }: { children: React.ReactElement }) {
  const role = getRole();
  if (getAccessToken() && role) return <Navigate to={landingForRole(role)} replace />;
  return children;
}

function FullScreenLoader() {
  return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;
}

export default function AppRouter() {
  const { loading } = useSession();
  const location = useLocation();
  if (loading && location.pathname !== '/signin' && location.pathname !== '/signup') {
    return <FullScreenLoader />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/signin" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allow={[UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.SUPERADMIN]}>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/*"
            element={
              <ProtectedRoute allow={[UserRoles.CLIENT]}>
                <ClientRoutes />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<ErrorPanel variant="not-found" />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

import { Navigate, useLocation } from 'react-router-dom';
import { UserRoles } from '@RealEstate/types';
import { getAccessToken, getRole, landingForRole } from './tokens';

type Props = {
  children: React.ReactElement;
  allow?: UserRoles[];
};

export function ProtectedRoute({ children, allow }: Props) {
  const location = useLocation();
  if (!getAccessToken()) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }
  if (allow) {
    const role = getRole();
    if (!role || !allow.includes(role)) {
      return <Navigate to={role ? landingForRole(role) : '/signin'} replace />;
    }
  }
  return children;
}

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../theme/ThemeContext';

/** Clear the session and send the user back to the sign-in page. */
export function useSignOut(): () => void {
  const { logout } = useSession();
  const navigate = useNavigate();
  return useCallback(() => {
    logout();
    navigate('/signin', { replace: true });
  }, [logout, navigate]);
}
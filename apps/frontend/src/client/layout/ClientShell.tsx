import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faGear } from '@fortawesome/free-solid-svg-icons';
import { useSession } from '../../shared/theme/ThemeContext';
import { clearTokens } from '../../shared/auth/tokens';
import './ClientShell.css';

function initials(firstName?: string | null, lastName?: string | null, email?: string) {
  const f = (firstName ?? '').trim();
  const l = (lastName ?? '').trim();
  if (f || l) return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase();
  return (email ?? '?').slice(0, 2).toUpperCase();
}

export default function ClientShell() {
  const { me } = useSession();
  const navigate = useNavigate();

  function signOut() {
    clearTokens();
    navigate('/signin', { replace: true });
  }

  const brandName = me?.tenant?.name ?? 'Owner Portal';
  const greeting = me?.firstName ? `Welcome back, ${me.firstName}` : 'Welcome back';

  return (
    <div className="cli-shell">
      <header className="cli-topbar">
        <div className="cli-logo">
          <div className="cli-logo-mark">{brandName[0]?.toUpperCase() ?? '·'}</div>
          <div>
            <div className="cli-brand">{brandName}</div>
            <div className="cli-brand-sub">Owner Portal</div>
          </div>
        </div>

        <nav className="cli-tabs">
          <NavLink to="/client" end className={({isActive}) => `cli-tab ${isActive ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faGauge} /> Overview
          </NavLink>
          <NavLink to="/client/settings" className={({isActive}) => `cli-tab ${isActive ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faGear} /> Settings
          </NavLink>
        </nav>

        <div className="cli-topbar-right">
          <div className="cli-avatar">{initials(me?.firstName, me?.lastName, me?.email)}</div>
          <button className="cli-signout" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <div className="cli-greet">
        <div className="cli-greet-h">{greeting}</div>
        <div className="cli-greet-sub">{me?.email}</div>
      </div>

      <main className="cli-content">
        <Outlet />
      </main>
    </div>
  );
}

import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faBuilding, faGear } from '@fortawesome/free-solid-svg-icons';
import { UserRoles } from '@RealEstate/types';
import { useSession } from '../../shared/theme/ThemeContext';
import './AdminShell.css';

function initials(firstName?: string | null, lastName?: string | null, email?: string) {
  const f = (firstName ?? '').trim();
  const l = (lastName ?? '').trim();
  if (f || l) return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase();
  return (email ?? '?').slice(0, 2).toUpperCase();
}

const TITLES: Record<string, { title: string; sub: string }> = {
  '/admin': { title: 'Dashboard', sub: 'Workspace' },
  '/admin/tenants': { title: 'Tenants', sub: 'Platform' },
  '/admin/settings': { title: 'Settings', sub: 'Account' },
};

export default function AdminShell() {
  const { me, logout } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  function signOut() {
    logout();
    navigate('/signin', { replace: true });
  }

  const isSuper = me?.role === UserRoles.SUPERADMIN;
  const tenantName = me?.tenant?.name ?? (isSuper ? 'Platform' : '—');
  const roleLabel = me?.role === UserRoles.ADMIN ? 'Admin'
    : me?.role === UserRoles.EMPLOYEE ? 'Agent'
    : me?.role === UserRoles.SUPERADMIN ? 'Superadmin'
    : '';

  const pageMeta = TITLES[location.pathname] ?? { title: '', sub: '' };

  return (
    <div className="adm-shell">
      <header className="adm-topbar">
        <div className="adm-brand-zone">
          <div className="adm-brand-mark">{tenantName[0]?.toUpperCase() ?? '·'}</div>
          <div>
            <div className="adm-brand-name">{tenantName}</div>
            <div className="adm-brand-sub">{isSuper ? 'Platform Console' : 'Agency Portal'}</div>
          </div>
        </div>

        <div className="adm-topbar-main">
          <div className="adm-topbar-titles">
            <span className="adm-topbar-title">{pageMeta.title}</span>
            <span className="adm-topbar-sub">{pageMeta.sub}</span>
          </div>

          <div className="adm-acct">
            <div className="adm-acct-id">
              <div className="adm-acct-name">{me?.firstName ?? me?.email}</div>
              <div className="adm-acct-role">{roleLabel}</div>
            </div>
            <div className="adm-user-avatar">{initials(me?.firstName, me?.lastName, me?.email)}</div>
            <button className="adm-user-signout" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>

      <div className="adm-below">
        <aside className="adm-sidebar">
          <nav className="adm-nav">
            <div className="adm-nav-section">Workspace</div>
            <NavLink to="/admin" end className={({isActive}) => `adm-nav-item ${isActive ? 'active' : ''}`}>
              <span className="adm-nav-icon"><FontAwesomeIcon icon={faGauge} /></span> Dashboard
            </NavLink>
            {isSuper && (
              <NavLink to="/admin/tenants" className={({isActive}) => `adm-nav-item ${isActive ? 'active' : ''}`}>
                <span className="adm-nav-icon"><FontAwesomeIcon icon={faBuilding} /></span> Tenants
              </NavLink>
            )}
            <div className="adm-nav-section">Account</div>
            <NavLink to="/admin/settings" className={({isActive}) => `adm-nav-item ${isActive ? 'active' : ''}`}>
              <span className="adm-nav-icon"><FontAwesomeIcon icon={faGear} /></span> Settings
            </NavLink>
          </nav>
        </aside>

        <main className="adm-main">
          <div className="adm-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

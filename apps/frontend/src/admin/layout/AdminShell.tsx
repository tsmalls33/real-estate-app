import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faBuilding, faGear } from '@fortawesome/free-solid-svg-icons';
import { UserRoles } from '@RealEstate/types';
import { useSession } from '../../shared/theme/ThemeContext';
import { useSignOut } from '../../shared/auth/useSignOut';
import { initials } from '../../shared/format/initials';

const TITLES: Record<string, { title: string; sub: string }> = {
  '/admin': { title: 'Dashboard', sub: 'Workspace' },
  '/admin/tenants': { title: 'Tenants', sub: 'Platform' },
  '/admin/settings': { title: 'Settings', sub: 'Account' },
};

const navItem = (isActive: boolean) =>
  `relative flex items-center gap-[11px] py-[9px] px-[11px] rounded-[7px] text-[13px] cursor-pointer no-underline mb-[2px] transition-[background-color,color] duration-[120ms] ease-[ease] hover:bg-hover hover:text-text ${
    isActive
      ? "bg-hover text-text font-semibold before:content-[''] before:absolute before:left-0 before:top-[7px] before:bottom-[7px] before:w-[2px] before:rounded-[2px] before:bg-brand-secondary"
      : 'text-text-muted'
  }`;

export default function AdminShell() {
  const { me } = useSession();
  const signOut = useSignOut();
  const location = useLocation();

  const isSuper = me?.role === UserRoles.SUPERADMIN;
  const tenantName = me?.tenant?.name ?? (isSuper ? 'Platform' : '—');
  const roleLabel = me?.role === UserRoles.ADMIN ? 'Admin'
    : me?.role === UserRoles.EMPLOYEE ? 'Agent'
    : me?.role === UserRoles.SUPERADMIN ? 'Superadmin'
    : '';

  const pageMeta = TITLES[location.pathname] ?? { title: '', sub: '' };

  return (
    <div className="flex flex-col min-h-screen bg-surface-2">
      <header className="h-[56px] flex items-stretch bg-surface border-b border-border">
        <div className="w-[236px] flex-shrink-0 flex items-center gap-[11px] px-[16px] shadow-[inset_0_-2px_0_var(--brand-secondary)]">
          <div className="w-[30px] h-[30px] rounded-[8px] bg-brand-primary text-brand-on-primary grid place-items-center font-extrabold text-[14px] tracking-[-0.02em] flex-shrink-0">{tenantName[0]?.toUpperCase() ?? '·'}</div>
          <div>
            <div className="text-[13.5px] font-bold text-text tracking-[-0.01em] leading-[1.1]">{tenantName}</div>
            <div className="text-[9px] text-text-faint tracking-[0.15em] uppercase mt-[2px]">{isSuper ? 'Platform Console' : 'Agency Portal'}</div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-between px-[24px] min-w-0">
          <div>
            <span className="text-[13px] font-bold text-text tracking-[-0.01em]">{pageMeta.title}</span>
            <span className="text-[11px] text-text-muted tracking-[0.06em] uppercase ml-[8px]">{pageMeta.sub}</span>
          </div>

          <div className="flex items-center gap-[12px]">
            <div className="text-right leading-[1.15]">
              <div className="text-[12px] font-semibold text-text">{me?.firstName ?? me?.email}</div>
              <div className="text-[10px] text-text-muted tracking-[0.04em] uppercase">{roleLabel}</div>
            </div>
            <div className="w-[30px] h-[30px] rounded-full bg-brand-primary text-brand-on-primary grid place-items-center font-bold text-[11px] flex-shrink-0">{initials(me?.firstName, me?.lastName, me?.email)}</div>
            <button className="bg-transparent border border-border-strong text-text-muted text-[11px] py-[7px] px-[12px] rounded-[999px] cursor-pointer tracking-[0.04em] uppercase font-semibold hover:text-text hover:border-text-muted" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-[12px] p-[12px] min-h-0">
        <aside className="w-[224px] flex-shrink-0 bg-surface border border-border rounded-[12px] p-[10px]">
          <nav className="flex flex-col">
            <div className="text-[9px] tracking-[0.15em] text-text-faint uppercase pt-[12px] px-[10px] pb-[6px] font-semibold">Workspace</div>
            <NavLink to="/admin" end className={({isActive}) => navItem(isActive)}>
              <span className="text-[13px] w-[16px] text-center flex-shrink-0 opacity-90"><FontAwesomeIcon icon={faGauge} /></span> Dashboard
            </NavLink>
            {isSuper && (
              <NavLink to="/admin/tenants" className={({isActive}) => navItem(isActive)}>
                <span className="text-[13px] w-[16px] text-center flex-shrink-0 opacity-90"><FontAwesomeIcon icon={faBuilding} /></span> Tenants
              </NavLink>
            )}
            <div className="text-[9px] tracking-[0.15em] text-text-faint uppercase pt-[12px] px-[10px] pb-[6px] font-semibold">Account</div>
            <NavLink to="/admin/settings" className={({isActive}) => navItem(isActive)}>
              <span className="text-[13px] w-[16px] text-center flex-shrink-0 opacity-90"><FontAwesomeIcon icon={faGear} /></span> Settings
            </NavLink>
          </nav>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 py-[12px] px-[16px] overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

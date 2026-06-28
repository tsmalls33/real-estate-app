import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faBuilding, faGear, faBars, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { UserRoles } from '@RealEstate/types';
import { useSession } from '../../shared/theme/ThemeContext';
import { useSignOut } from '../../shared/auth/useSignOut';
import { initials } from '../../shared/format/initials';

const navItem = (isActive: boolean) =>
  `relative flex items-center gap-[11px] py-[9px] px-[11px] rounded-[7px] text-[13px] cursor-pointer no-underline mb-[2px] transition-[background-color,color] duration-[120ms] ease-[ease] hover:bg-hover hover:text-text ${
    isActive
      ? "bg-hover text-text font-semibold before:content-[''] before:absolute before:left-0 before:top-[7px] before:bottom-[7px] before:w-[2px] before:rounded-[2px] before:bg-brand-secondary"
      : 'text-text-muted'
  }`;

export default function AdminShell() {
  const { t } = useTranslation();
  const { me } = useSession();
  const signOut = useSignOut();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const isSuper = me?.role === UserRoles.SUPERADMIN;
  const tenantName = me?.tenant?.name ?? (isSuper ? t('nav.platform') : t('common.emDash'));
  const roleLabel = me?.role === UserRoles.ADMIN ? t('roles.admin')
    : me?.role === UserRoles.EMPLOYEE ? t('roles.agent')
    : me?.role === UserRoles.SUPERADMIN ? t('roles.superadmin')
    : '';

  const TITLES: Record<string, { title: string; sub: string }> = {
    '/admin': { title: t('nav.dashboard'), sub: t('nav.workspace') },
    '/admin/tenants': { title: t('nav.tenants'), sub: t('nav.platform') },
    '/admin/settings': { title: t('nav.settings'), sub: t('nav.account') },
  };
  const pageMeta = TITLES[location.pathname] ?? { title: '', sub: '' };

  return (
    <div className="flex flex-col min-h-screen bg-surface-2">
      <header className="h-[56px] flex items-stretch bg-surface border-b border-border">
        <div className="w-[236px] flex-shrink-0 flex items-center gap-[11px] px-[16px] shadow-[inset_0_-2px_0_var(--brand-secondary)] max-[899px]:w-auto max-[899px]:px-[12px] max-[899px]:shadow-none">
          <div className="w-[30px] h-[30px] rounded-[8px] bg-brand-primary text-brand-on-primary grid place-items-center font-extrabold text-[14px] tracking-[-0.02em] flex-shrink-0">{tenantName[0]?.toUpperCase() ?? '·'}</div>
          <div>
            <div className="text-[13.5px] font-bold text-text tracking-[-0.01em] leading-[1.1]">{tenantName}</div>
            <div className="text-[9px] text-text-faint tracking-[0.15em] uppercase mt-[2px]">{isSuper ? t('shell.platformConsole') : t('shell.agencyPortal')}</div>
          </div>
        </div>

        <button
          type="button"
          aria-label={t('shell.openMenu')}
          className="hidden max-[899px]:grid max-[899px]:order-first place-items-center w-[44px] flex-shrink-0 text-text-muted hover:text-text"
          onClick={() => setDrawerOpen(true)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        <div className="flex-1 flex items-center justify-between px-[24px] min-w-0 max-[899px]:hidden">
          <div>
            <span className="text-[13px] font-bold text-text tracking-[-0.01em]">{pageMeta.title}</span>
            <span className="text-[11px] text-text-muted tracking-[0.06em] uppercase ml-[8px]">{pageMeta.sub}</span>
          </div>

          <div className="flex items-center gap-[12px]">
            <div className="text-right leading-[1.15] max-[899px]:hidden">
              <div className="text-[12px] font-semibold text-text">{me?.firstName ?? me?.email}</div>
              <div className="text-[10px] text-text-muted tracking-[0.04em] uppercase">{roleLabel}</div>
            </div>
            <div className="w-[30px] h-[30px] rounded-full bg-brand-primary text-brand-on-primary grid place-items-center font-bold text-[11px] flex-shrink-0">{initials(me?.firstName, me?.lastName, me?.email)}</div>
            <button className="bg-transparent border border-border-strong text-text-muted text-[11px] py-[7px] px-[12px] rounded-[999px] cursor-pointer tracking-[0.04em] uppercase font-semibold hover:text-text hover:border-text-muted" onClick={signOut}>{t('nav.signOut')}</button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-[12px] p-[12px] min-h-0">
        {drawerOpen && (
          <div
            className="hidden max-[899px]:block fixed inset-0 z-40 bg-black/40"
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <aside className={`w-[224px] flex-shrink-0 bg-surface border border-border rounded-[12px] p-[10px] max-[899px]:fixed max-[899px]:inset-y-0 max-[899px]:left-0 max-[899px]:z-50 max-[899px]:w-[260px] max-[899px]:rounded-none max-[899px]:flex max-[899px]:flex-col max-[899px]:transition-transform max-[899px]:duration-[200ms] ${drawerOpen ? 'max-[899px]:translate-x-0' : 'max-[899px]:-translate-x-full'}`}>
          <div className="hidden max-[899px]:flex items-center gap-[11px] px-[10px] pb-[14px] mb-[4px] border-b border-border">
            <div className="w-[30px] h-[30px] rounded-[8px] bg-brand-primary text-brand-on-primary grid place-items-center font-extrabold text-[14px] tracking-[-0.02em] flex-shrink-0">{tenantName[0]?.toUpperCase() ?? '·'}</div>
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-text tracking-[-0.01em] leading-[1.1] truncate">{tenantName}</div>
              <div className="text-[9px] text-text-faint tracking-[0.15em] uppercase mt-[2px]">{isSuper ? t('shell.platformConsole') : t('shell.agencyPortal')}</div>
            </div>
          </div>
          <nav className="flex flex-col max-[899px]:flex-1">
            <div className="text-[9px] tracking-[0.15em] text-text-faint uppercase pt-[12px] px-[10px] pb-[6px] font-semibold">{t('nav.workspace')}</div>
            <NavLink to="/admin" end className={({isActive}) => navItem(isActive)}>
              <span className="text-[13px] w-[16px] text-center flex-shrink-0 opacity-90"><FontAwesomeIcon icon={faGauge} /></span> {t('nav.dashboard')}
            </NavLink>
            {isSuper && (
              <NavLink to="/admin/tenants" className={({isActive}) => navItem(isActive)}>
                <span className="text-[13px] w-[16px] text-center flex-shrink-0 opacity-90"><FontAwesomeIcon icon={faBuilding} /></span> {t('nav.tenants')}
              </NavLink>
            )}
            <div className="text-[9px] tracking-[0.15em] text-text-faint uppercase pt-[12px] px-[10px] pb-[6px] font-semibold">{t('nav.account')}</div>
            <NavLink to="/admin/settings" className={({isActive}) => navItem(isActive)}>
              <span className="text-[13px] w-[16px] text-center flex-shrink-0 opacity-90"><FontAwesomeIcon icon={faGear} /></span> {t('nav.settings')}
            </NavLink>
          </nav>

          <div className="hidden max-[899px]:block px-[10px] pt-[14px] mt-[4px] border-t border-border">
            <div className="flex items-center gap-[10px] pb-[12px]">
              <div className="w-[32px] h-[32px] rounded-full bg-brand-primary text-brand-on-primary grid place-items-center font-bold text-[11px] flex-shrink-0">{initials(me?.firstName, me?.lastName, me?.email)}</div>
              <div className="leading-[1.15] min-w-0">
                <div className="text-[12.5px] font-semibold text-text truncate">{me?.firstName ?? me?.email}</div>
                <div className="text-[10px] text-text-muted tracking-[0.04em] uppercase">{roleLabel}</div>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-[9px] py-[10px] rounded-[9px] bg-transparent border border-border-strong text-text-muted text-[12px] font-semibold tracking-[0.04em] uppercase cursor-pointer hover:text-text hover:border-text-muted"
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} /> {t('nav.signOut')}
            </button>
          </div>
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

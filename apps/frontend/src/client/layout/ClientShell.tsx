import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faBars, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useSession } from '../../shared/theme/ThemeContext';
import { useSignOut } from '../../shared/auth/useSignOut';
import { initials } from '../../shared/format/initials';
import { focusRing } from '../../shared/styles/focusRing';
import PropertySwitcher from '../components/PropertySwitcher';

const navItem = (isActive: boolean) =>
  `relative flex items-center gap-[11px] py-[9px] px-[11px] rounded-[7px] text-[13px] cursor-pointer no-underline mb-[2px] transition-[background-color,color] duration-[120ms] ease-[ease] hover:bg-hover hover:text-text ${
    isActive
      ? "bg-hover text-text font-semibold before:content-[''] before:absolute before:left-0 before:top-[7px] before:bottom-[7px] before:w-[2px] before:rounded-[2px] before:bg-brand-secondary"
      : 'text-text-muted'
  }`;

const tabLink = (isActive: boolean) =>
  `inline-flex items-center gap-[6px] py-[8px] px-[14px] rounded-full text-[13px] cursor-pointer no-underline ${focusRing} ${
    isActive ? 'bg-brand-secondary text-brand-on-secondary font-semibold' : 'text-text-muted hover:text-text'
  }`;

export default function ClientShell() {
  const { t, i18n } = useTranslation();
  const { me } = useSession();
  const signOut = useSignOut();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [today] = useState(() => new Date());

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const brandName = me?.tenant?.name ?? t('shell.ownerPortal');
  const greeting = me?.firstName ? t('shell.welcomeBack', { name: me.firstName }) : t('shell.welcomeBackGeneric');

  const TITLES: Record<string, string> = {
    '/client': t('client.dashboard.overview'),
    '/client/reservations': t('client.dashboard.reservations'),
    '/client/income': t('client.dashboard.income'),
    '/client/settings': t('nav.settings'),
  };
  const pageTitle = TITLES[location.pathname] ?? '';

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col">
      <header role="banner" className="sticky top-0 z-30 flex items-center justify-between gap-[18px] py-[14px] px-[32px] backdrop-blur-md border-b border-border max-client:px-4" style={{ background: 'color-mix(in srgb, var(--surface) 86%, transparent)' }}>
        <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] pointer-events-none" style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--brand-secondary) 65%, transparent), color-mix(in srgb, var(--brand-primary) 25%, transparent) 55%, transparent)' }} />
        <div className="hidden max-client:flex items-center gap-[10px] min-w-0">
          <button
            type="button"
            aria-label={t('shell.openMenu')}
            className="grid place-items-center w-[38px] h-[38px] flex-shrink-0 rounded-[9px] text-text-muted hover:text-text hover:bg-hover"
            onClick={() => setDrawerOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-text tracking-[-0.01em] leading-[1.1] truncate">{pageTitle}</div>
            <div className="text-[10px] text-text-muted tracking-[0.16em] uppercase truncate">{brandName}</div>
          </div>
        </div>

        <div className="flex items-center gap-[12px] max-client:hidden">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-brand-primary text-brand-on-primary grid place-items-center font-extrabold tracking-[-0.02em]">{brandName[0]?.toUpperCase() ?? '·'}</div>
          <div>
            <div className="text-[14px] font-bold text-text tracking-[-0.01em]">{brandName}</div>
            <div className="text-[10px] text-text-muted tracking-[0.16em] uppercase">{t('shell.ownerPortal')}</div>
          </div>
        </div>

        <nav className="flex gap-[4px] max-client:hidden">
          <NavLink to="/client" end className={({ isActive }) => tabLink(isActive)}>
            {t('client.dashboard.overview')}
          </NavLink>
          <NavLink to="/client/reservations" className={({ isActive }) => tabLink(isActive)}>
            {t('client.dashboard.reservations')}
          </NavLink>
          <NavLink to="/client/income" className={({ isActive }) => tabLink(isActive)}>
            {t('client.dashboard.income')}
          </NavLink>
        </nav>

        <div className="flex items-center gap-[12px] max-client:hidden">
          <NavLink
            to="/client/settings"
            className={({ isActive }) =>
              `grid place-items-center w-[36px] h-[36px] rounded-[9px] text-text-muted hover:text-text hover:bg-hover ${focusRing} ${
                isActive ? 'text-brand-secondary' : ''
              }`
            }
            aria-label={t('nav.settings')}
          >
            <FontAwesomeIcon icon={faGear} />
          </NavLink>
          <div className="w-[36px] h-[36px] rounded-full bg-brand-secondary text-brand-on-secondary grid place-items-center font-bold text-[12px]">{initials(me?.firstName, me?.lastName, me?.email)}</div>
          <button
            className={`bg-transparent border border-border-strong text-text-muted text-[12px] py-[7px] px-[12px] rounded-full cursor-pointer tracking-[0.04em] uppercase font-semibold hover:text-text ${focusRing}`}
            onClick={signOut}
          >
            {t('nav.signOut')}
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div
          className="hidden max-client:block fixed inset-0 z-40 bg-black/40"
          aria-hidden="true"
          data-testid="drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside className={`hidden max-client:flex flex-col fixed inset-y-0 left-0 z-50 w-[260px] bg-surface border-r border-border p-[10px] transition-transform duration-[200ms] ${drawerOpen ? 'translate-x-0' : '-translate-x-full max-client:invisible'}`}>
        <div className="flex items-center gap-[11px] px-[10px] pb-[14px] mb-[4px] border-b border-border">
          <div className="w-[30px] h-[30px] rounded-[8px] bg-brand-primary text-brand-on-primary grid place-items-center font-extrabold text-[14px] tracking-[-0.02em] flex-shrink-0">{brandName[0]?.toUpperCase() ?? '·'}</div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold text-text tracking-[-0.01em] leading-[1.1] truncate">{brandName}</div>
            <div className="text-[9px] text-text-faint tracking-[0.15em] uppercase mt-[2px]">{t('shell.ownerPortal')}</div>
          </div>
        </div>
        <nav className="flex flex-col flex-1">
          <NavLink to="/client" end className={({ isActive }) => navItem(isActive)}>
            {t('client.dashboard.overview')}
          </NavLink>
          <NavLink to="/client/reservations" className={({ isActive }) => navItem(isActive)}>
            {t('client.dashboard.reservations')}
          </NavLink>
          <NavLink to="/client/income" className={({ isActive }) => navItem(isActive)}>
            {t('client.dashboard.income')}
          </NavLink>
          <div className="mt-auto border-t border-border pt-[4px]">
            <NavLink to="/client/settings" className={({ isActive }) => navItem(isActive)}>
              <span className="text-[13px] w-[16px] text-center flex-shrink-0 opacity-90"><FontAwesomeIcon icon={faGear} /></span> {t('nav.settings')}
            </NavLink>
          </div>
        </nav>
        <div className="px-[10px] pt-[14px] mt-[4px] border-t border-border">
          <div className="flex items-center gap-[10px] pb-[12px]">
            <div className="w-[32px] h-[32px] rounded-full bg-brand-secondary text-brand-on-secondary grid place-items-center font-bold text-[11px] flex-shrink-0">{initials(me?.firstName, me?.lastName, me?.email)}</div>
            <div className="leading-[1.15] min-w-0">
              <div className="text-[12.5px] font-semibold text-text truncate">{me?.firstName ?? me?.email}</div>
              <div className="text-[10px] text-text-muted truncate">{me?.email}</div>
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

      <div className="w-full max-w-[1240px] mx-auto pt-[26px] px-[32px] pb-[8px] max-client:px-4 animate-[rise_0.4s_ease-out_both]">
        <div className="text-[24px] font-bold text-text tracking-[-0.02em]">
          {greeting}{' '}
          <span aria-hidden className="inline-block animate-[wave_1.1s_ease-in-out_0.3s_1] origin-[70%_70%]">👋</span>
        </div>
        <div className="text-[12px] text-text-muted mt-[4px] first-letter:uppercase">
          {new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' }).format(today)}
        </div>
      </div>

      <div className="w-full max-w-[1240px] mx-auto px-[32px] pb-[8px] max-client:px-4">
        <PropertySwitcher />
      </div>

      <main className="w-full max-w-[1240px] mx-auto pt-[12px] px-[32px] pb-[40px] flex-1 max-client:px-4">
        <Outlet />
      </main>
    </div>
  );
}

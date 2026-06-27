import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faGear } from '@fortawesome/free-solid-svg-icons';
import { useSession } from '../../shared/theme/ThemeContext';
import { useSignOut } from '../../shared/auth/useSignOut';
import { initials } from '../../shared/format/initials';

export default function ClientShell() {
  const { t } = useTranslation();
  const { me } = useSession();
  const signOut = useSignOut();

  const brandName = me?.tenant?.name ?? t('shell.ownerPortal');
  const greeting = me?.firstName ? t('shell.welcomeBack', { name: me.firstName }) : t('shell.welcomeBackGeneric');

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col">
      <header className="flex items-center justify-between gap-[18px] py-[14px] px-[32px] bg-surface border-b border-border">
        <div className="flex items-center gap-[12px]">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-brand-primary text-brand-on-primary grid place-items-center font-extrabold tracking-[-0.02em]">{brandName[0]?.toUpperCase() ?? '·'}</div>
          <div>
            <div className="text-[14px] font-bold text-text tracking-[-0.01em]">{brandName}</div>
            <div className="text-[10px] text-text-muted tracking-[0.16em] uppercase">{t('shell.ownerPortal')}</div>
          </div>
        </div>

        <nav className="flex gap-[4px]">
          <NavLink
            to="/client"
            end
            className={({ isActive }) =>
              `inline-flex items-center gap-[6px] py-[8px] px-[14px] rounded-full text-[13px] cursor-pointer no-underline ${
                isActive ? 'text-brand-secondary font-semibold' : 'text-text-muted hover:text-text'
              }`
            }
          >
            <FontAwesomeIcon icon={faGauge} /> {t('nav.overview')}
          </NavLink>
          <NavLink
            to="/client/settings"
            className={({ isActive }) =>
              `inline-flex items-center gap-[6px] py-[8px] px-[14px] rounded-full text-[13px] cursor-pointer no-underline ${
                isActive ? 'text-brand-secondary font-semibold' : 'text-text-muted hover:text-text'
              }`
            }
          >
            <FontAwesomeIcon icon={faGear} /> {t('nav.settings')}
          </NavLink>
        </nav>

        <div className="flex items-center gap-[12px]">
          <div className="w-[36px] h-[36px] rounded-full bg-brand-secondary text-brand-on-secondary grid place-items-center font-bold text-[12px]">{initials(me?.firstName, me?.lastName, me?.email)}</div>
          <button
            className="bg-transparent border border-border-strong text-text-muted text-[12px] py-[7px] px-[12px] rounded-full cursor-pointer tracking-[0.04em] uppercase font-semibold hover:text-text"
            onClick={signOut}
          >
            {t('nav.signOut')}
          </button>
        </div>
      </header>

      <div className="pt-[24px] px-[32px] pb-[8px]">
        <div className="text-[22px] font-bold text-text tracking-[-0.02em]">{greeting}</div>
        <div className="text-[12px] text-text-muted mt-[4px]">{me?.email}</div>
      </div>

      <main className="pt-[12px] px-[32px] pb-[40px] flex-1">
        <Outlet />
      </main>
    </div>
  );
}

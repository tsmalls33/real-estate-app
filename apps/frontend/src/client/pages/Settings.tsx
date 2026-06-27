import { useTranslation } from 'react-i18next';
import { useSession } from '../../shared/theme/ThemeContext';
import ThemeToggle from '../../shared/components/ThemeToggle/ThemeToggle';
import LanguageToggle from '../../shared/components/LanguageToggle/LanguageToggle';

export default function Settings() {
  const { t } = useTranslation();
  const { me } = useSession();
  return (
    <div className="grid gap-[18px] max-w-[640px]">
      <section className="bg-surface border border-border rounded-[14px] px-6 py-[22px]">
        <h3 className="text-sm font-bold tracking-[-0.01em] text-text mb-1 mt-0">{t('settings.profile.title')}</h3>
        <p className="text-xs text-text-muted mt-0 mb-4">{t('settings.profile.description')}</p>
        <div className="grid grid-cols-[140px_1fr] gap-3 items-center py-[10px] text-[13px] border-t border-border first-of-type:border-t-0 first-of-type:pt-0">
          <div className="text-text-muted text-[11px] tracking-[0.06em] uppercase font-semibold">{t('settings.profile.name')}</div>
          <div className="text-text">
            {[me?.firstName, me?.lastName].filter(Boolean).join(' ') || t('common.emDash')}
          </div>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-3 items-center py-[10px] text-[13px] border-t border-border first-of-type:border-t-0 first-of-type:pt-0">
          <div className="text-text-muted text-[11px] tracking-[0.06em] uppercase font-semibold">{t('settings.profile.email')}</div>
          <div className="text-text">{me?.email}</div>
        </div>
      </section>

      <section className="bg-surface border border-border rounded-[14px] px-6 py-[22px]">
        <h3 className="text-sm font-bold tracking-[-0.01em] text-text mb-1 mt-0">{t('settings.appearance.title')}</h3>
        <p className="text-xs text-text-muted mt-0 mb-4">{t('settings.appearance.description')}</p>
        <div className="grid grid-cols-[140px_1fr] gap-3 items-center py-[10px] text-[13px] border-t border-border first-of-type:border-t-0 first-of-type:pt-0">
          <div className="text-text-muted text-[11px] tracking-[0.06em] uppercase font-semibold">{t('settings.appearance.theme')}</div>
          <div className="text-text"><ThemeToggle /></div>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-3 items-center py-[10px] text-[13px] border-t border-border first-of-type:border-t-0 first-of-type:pt-0">
          <div className="text-text-muted text-[11px] tracking-[0.06em] uppercase font-semibold">{t('settings.language.label')}</div>
          <div className="text-text"><LanguageToggle /></div>
        </div>
      </section>
    </div>
  );
}

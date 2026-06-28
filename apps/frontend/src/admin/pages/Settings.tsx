import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserRoles } from '@RealEstate/types';
import { tenantApi } from '../../shared/api/services';
import { useSession } from '../../shared/theme/ThemeContext';
import ThemeToggle from '../../shared/components/ThemeToggle/ThemeToggle';
import LanguageToggle from '../../shared/components/LanguageToggle/LanguageToggle';

const DEFAULTS = {
  backgroundColor: '#FFFFFF',
  brandColor: '#5A303A',
  secondaryColor: '#EB4F1C',
};

const HEX_RE = /^#([0-9A-F]{6})$/;

type ColorKey = 'backgroundColor' | 'brandColor' | 'secondaryColor';

function normalizeHex(value: string): string {
  const trimmed = value.trim().toUpperCase();
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

export default function Settings() {
  const { t } = useTranslation();
  const { me, refresh } = useSession();
  const tenant = me?.tenant;
  const canEditTheme = me?.role === UserRoles.ADMIN || me?.role === UserRoles.SUPERADMIN;

  const [colors, setColors] = useState({
    backgroundColor: tenant?.theme?.backgroundColor ?? DEFAULTS.backgroundColor,
    brandColor: tenant?.theme?.brandColor ?? DEFAULTS.brandColor,
    secondaryColor: tenant?.theme?.secondaryColor ?? DEFAULTS.secondaryColor,
  });
  const [hexDrafts, setHexDrafts] = useState(colors);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function onPicker(key: ColorKey, value: string) {
    const next = normalizeHex(value);
    setColors(prev => ({ ...prev, [key]: next }));
    setHexDrafts(prev => ({ ...prev, [key]: next }));
  }

  function onHexChange(key: ColorKey, value: string) {
    setHexDrafts(prev => ({ ...prev, [key]: value.toUpperCase() }));
    const normalized = normalizeHex(value);
    if (HEX_RE.test(normalized)) {
      setColors(prev => ({ ...prev, [key]: normalized }));
    }
  }

  const allValid = (Object.keys(hexDrafts) as ColorKey[]).every(k => HEX_RE.test(normalizeHex(hexDrafts[k])));

  async function saveTheme(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant || !allValid) return;
    setSaving(true);
    setMsg(null);
    try {
      await tenantApi.updateTheme(tenant.id_tenant, colors);
      await refresh();
      setMsg({ kind: 'ok', text: t('settings.tenantTheme.updated') });
    } catch (err: unknown) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : t('settings.tenantTheme.updateFailed') });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-[18px] max-w-[720px]">
      <section className="bg-surface border border-border rounded-radius px-6 py-[22px]">
        <h3 className="text-[13px] font-bold tracking-[-0.01em] text-text mb-1 mt-0">{t('settings.profile.title')}</h3>
        <p className="text-xs text-text-muted mb-4 mt-0">{t('settings.profile.description')}</p>
        <div className="grid grid-cols-[140px_1fr] max-[599px]:grid-cols-1 gap-3 items-center text-[13px] py-2 border-t border-border first-of-type:border-t-0 first-of-type:pt-0">
          <div className="text-text-muted text-[11px] tracking-[0.06em] uppercase font-semibold">{t('settings.profile.name')}</div>
          <div className="text-text">{[me?.firstName, me?.lastName].filter(Boolean).join(' ') || t('common.emDash')}</div>
        </div>
        <div className="grid grid-cols-[140px_1fr] max-[599px]:grid-cols-1 gap-3 items-center text-[13px] py-2 border-t border-border first-of-type:border-t-0 first-of-type:pt-0">
          <div className="text-text-muted text-[11px] tracking-[0.06em] uppercase font-semibold">{t('settings.profile.email')}</div>
          <div className="text-text">{me?.email}</div>
        </div>
        <div className="grid grid-cols-[140px_1fr] max-[599px]:grid-cols-1 gap-3 items-center text-[13px] py-2 border-t border-border first-of-type:border-t-0 first-of-type:pt-0">
          <div className="text-text-muted text-[11px] tracking-[0.06em] uppercase font-semibold">{t('settings.profile.tenant')}</div>
          <div className="text-text">{tenant?.name ?? t('common.emDash')}</div>
        </div>
      </section>

      <section className="bg-surface border border-border rounded-radius px-6 py-[22px]">
        <h3 className="text-[13px] font-bold tracking-[-0.01em] text-text mb-1 mt-0">{t('settings.appearance.title')}</h3>
        <p className="text-xs text-text-muted mb-4 mt-0">{t('settings.appearance.descriptionAdmin')}</p>
        <div className="grid grid-cols-[140px_1fr] max-[599px]:grid-cols-1 gap-3 items-center text-[13px] py-2 border-t border-border first-of-type:border-t-0 first-of-type:pt-0">
          <div className="text-text-muted text-[11px] tracking-[0.06em] uppercase font-semibold">{t('settings.appearance.theme')}</div>
          <div className="text-text"><ThemeToggle /></div>
        </div>
        <div className="grid grid-cols-[140px_1fr] max-[599px]:grid-cols-1 gap-3 items-center text-[13px] py-2 border-t border-border first-of-type:border-t-0 first-of-type:pt-0">
          <div className="text-text-muted text-[11px] tracking-[0.06em] uppercase font-semibold">{t('settings.language.label')}</div>
          <div className="text-text"><LanguageToggle /></div>
        </div>
      </section>

      {canEditTheme && tenant && (
        <section className="bg-surface border border-border rounded-radius px-6 py-[22px]">
          <h3 className="text-[13px] font-bold tracking-[-0.01em] text-text mb-1 mt-0">{t('settings.tenantTheme.title')}</h3>
          <p className="text-xs text-text-muted mb-4 mt-0">{t('settings.tenantTheme.description', { tenant: tenant.name })}</p>
          <form className="flex flex-col gap-[14px]" onSubmit={saveTheme}>
            {(['backgroundColor', 'brandColor', 'secondaryColor'] as ColorKey[]).map(key => {
              const label = key === 'backgroundColor' ? t('settings.tenantTheme.background')
                : key === 'brandColor' ? t('settings.tenantTheme.brandPrimary') : t('settings.tenantTheme.brandSecondary');
              const draft = hexDrafts[key];
              const valid = HEX_RE.test(normalizeHex(draft));
              return (
                <div key={key} className="grid grid-cols-[160px_1fr] max-[599px]:grid-cols-1 items-center gap-3">
                  <label htmlFor={`${key}-picker`} className="text-[11px] font-semibold text-text-muted tracking-[0.06em] uppercase">{label}</label>
                  <div className="flex flex-wrap items-center gap-[10px]">
                    <input id={`${key}-picker`} type="color" value={colors[key]}
                           className="w-[56px] h-[34px] p-0 border border-border-strong rounded-radius-sm bg-surface cursor-pointer"
                           onChange={e => onPicker(key, e.target.value)} />
                    <input type="text" value={draft} maxLength={7}
                           className={`w-[110px] h-[34px] px-[10px] py-0 border rounded-radius-sm bg-surface text-text font-mono text-[13px] uppercase focus:outline-none focus:border-brand-primary ${valid ? 'border-border-strong' : 'border-danger'}`}
                           spellCheck={false}
                           onChange={e => onHexChange(key, e.target.value)} />
                  </div>
                </div>
              );
            })}
            <div className="flex gap-2 mt-2">
              <button type="submit" className="bg-brand-primary text-brand-on-primary border-0 px-4 py-[9px] rounded-radius-sm font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" disabled={saving || !allValid}>
                {saving ? t('settings.tenantTheme.saving') : t('settings.tenantTheme.saveTheme')}
              </button>
            </div>
            {msg && <div className={`text-xs ${msg.kind === 'ok' ? 'text-success' : 'text-danger'}`}>{msg.text}</div>}
          </form>
        </section>
      )}
    </div>
  );
}

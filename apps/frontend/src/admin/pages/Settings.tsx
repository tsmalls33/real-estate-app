import { useState } from 'react';
import { UserRoles } from '@RealEstate/types';
import { tenantApi } from '../../shared/api/services';
import { useSession } from '../../shared/theme/ThemeContext';
import ThemeToggle from '../../shared/components/ThemeToggle/ThemeToggle';
import './Settings.css';

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
    setColors(c => ({ ...c, [key]: next }));
    setHexDrafts(d => ({ ...d, [key]: next }));
  }

  function onHexChange(key: ColorKey, value: string) {
    setHexDrafts(d => ({ ...d, [key]: value.toUpperCase() }));
    const normalized = normalizeHex(value);
    if (HEX_RE.test(normalized)) {
      setColors(c => ({ ...c, [key]: normalized }));
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
      setMsg({ kind: 'ok', text: 'Theme updated.' });
    } catch (err: unknown) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Failed to update theme' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-grid">
      <section className="settings-card">
        <h3>Profile</h3>
        <p className="settings-card-sub">Your account details.</p>
        <div className="settings-row">
          <div className="settings-row-label">Name</div>
          <div className="settings-row-value">{[me?.firstName, me?.lastName].filter(Boolean).join(' ') || '—'}</div>
        </div>
        <div className="settings-row">
          <div className="settings-row-label">Email</div>
          <div className="settings-row-value">{me?.email}</div>
        </div>
        <div className="settings-row">
          <div className="settings-row-label">Tenant</div>
          <div className="settings-row-value">{tenant?.name ?? '—'}</div>
        </div>
      </section>

      <section className="settings-card">
        <h3>Appearance</h3>
        <p className="settings-card-sub">Applies to your account only.</p>
        <div className="settings-row">
          <div className="settings-row-label">Theme</div>
          <div className="settings-row-value"><ThemeToggle /></div>
        </div>
      </section>

      {canEditTheme && tenant && (
        <section className="settings-card">
          <h3>Tenant theme</h3>
          <p className="settings-card-sub">Colors apply to everyone in {tenant.name}.</p>
          <form className="theme-form" onSubmit={saveTheme}>
            {(['backgroundColor', 'brandColor', 'secondaryColor'] as ColorKey[]).map(key => {
              const label = key === 'backgroundColor' ? 'Background'
                : key === 'brandColor' ? 'Brand primary' : 'Brand secondary';
              const draft = hexDrafts[key];
              const valid = HEX_RE.test(normalizeHex(draft));
              return (
                <div key={key} className="theme-field">
                  <label htmlFor={`${key}-picker`}>{label}</label>
                  <div className="theme-color-row">
                    <input id={`${key}-picker`} type="color" value={colors[key]}
                           onChange={e => onPicker(key, e.target.value)} />
                    <input type="text" value={draft} maxLength={7}
                           className={valid ? '' : 'invalid'}
                           spellCheck={false}
                           onChange={e => onHexChange(key, e.target.value)} />
                  </div>
                </div>
              );
            })}
            <div className="theme-actions">
              <button type="submit" className="btn-primary" disabled={saving || !allValid}>
                {saving ? 'Saving…' : 'Save theme'}
              </button>
            </div>
            {msg && <div className={`theme-msg ${msg.kind}`}>{msg.text}</div>}
          </form>
        </section>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../shared/api/services';
import { setTokens, landingForRole } from '../../shared/auth/tokens';
import { useSession } from '../../shared/theme/ThemeContext';
import { authWrapStyle } from './authWrapStyle';
import { focusRing } from '../../shared/styles/focusRing';

import LanguageToggle from '../../shared/components/LanguageToggle/LanguageToggle';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refresh } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await authApi.signin(email, password);
      setTokens(data.accessToken, data.refreshToken);
      await refresh();
      navigate(landingForRole(data.user.role), { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.signIn.failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen grid place-items-center py-8 px-6 relative"
      style={authWrapStyle}
    >
      <div className="absolute top-4 right-4">
        <LanguageToggle variant="flags" />
      </div>
      <form
        className="w-full max-w-[380px] bg-surface border border-border rounded-radius shadow-md p-7"
        onSubmit={onSubmit}
      >
        <h1 className="text-[18px] font-bold tracking-[-0.01em] mt-0 mb-1 text-text">{t('auth.signIn.title')}</h1>
        <p className="text-xs text-text-muted mt-0 mb-[22px]">{t('auth.signIn.description')}</p>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label htmlFor="email" className="text-[11px] text-text-muted tracking-[0.04em] uppercase font-semibold">{t('auth.signIn.email')}</label>
          <input id="email" type="email" autoComplete="email" required
                 className={`h-[38px] px-3 border border-border-strong rounded-radius-sm bg-surface text-text transition-colors duration-[120ms] focus:border-brand-primary ${focusRing}`}
                 value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label htmlFor="password" className="text-[11px] text-text-muted tracking-[0.04em] uppercase font-semibold">{t('auth.signIn.password')}</label>
          <input id="password" type="password" autoComplete="current-password" required
                 className={`h-[38px] px-3 border border-border-strong rounded-radius-sm bg-surface text-text transition-colors duration-[120ms] focus:border-brand-primary ${focusRing}`}
                 value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <button
          className={`w-full h-10 mt-1.5 bg-brand-primary text-brand-on-primary border-0 rounded-radius-sm font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`}
          type="submit" disabled={submitting}
        >
          {submitting ? t('auth.signIn.submitting') : t('auth.signIn.submit')}
        </button>

        {error && <div role="alert" className="mt-2.5 text-xs text-danger">{error}</div>}

        <div className="mt-[18px] text-center text-xs text-text-muted">
          {t('auth.signIn.noAccount')} <Link to="/signup" className={`text-brand-primary font-semibold ${focusRing}`}>{t('auth.signIn.createOne')}</Link>
        </div>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../shared/api/services';
import { setTokens, landingForRole } from '../../shared/auth/tokens';
import { useSession } from '../../shared/theme/ThemeContext';
import LanguageToggle from '../../shared/components/LanguageToggle/LanguageToggle';
import { authWrapStyle } from './authWrapStyle';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refresh } = useSession();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authApi.signup({ email, password, firstName: firstName || undefined, lastName: lastName || undefined });
      // Public signup gives no tokens — sign the user in immediately afterwards.
      const session = await authApi.signin(email, password);
      setTokens(session.accessToken, session.refreshToken);
      await refresh();
      navigate(landingForRole(session.user.role), { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.signUp.failed'));
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
        <h1 className="text-[18px] font-bold tracking-[-0.01em] mt-0 mb-1 text-text">{t('auth.signUp.title')}</h1>
        <p className="text-xs text-text-muted mt-0 mb-[22px]">{t('auth.signUp.description')}</p>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label htmlFor="firstName" className="text-[11px] text-text-muted tracking-[0.04em] uppercase font-semibold">{t('auth.signUp.firstName')}</label>
          <input id="firstName"
                 className="h-[38px] px-3 border border-border-strong rounded-radius-sm bg-surface text-text outline-none transition-colors duration-[120ms] focus:border-brand-primary"
                 value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label htmlFor="lastName" className="text-[11px] text-text-muted tracking-[0.04em] uppercase font-semibold">{t('auth.signUp.lastName')}</label>
          <input id="lastName"
                 className="h-[38px] px-3 border border-border-strong rounded-radius-sm bg-surface text-text outline-none transition-colors duration-[120ms] focus:border-brand-primary"
                 value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label htmlFor="email" className="text-[11px] text-text-muted tracking-[0.04em] uppercase font-semibold">{t('auth.signUp.email')}</label>
          <input id="email" type="email" autoComplete="email" required
                 className="h-[38px] px-3 border border-border-strong rounded-radius-sm bg-surface text-text outline-none transition-colors duration-[120ms] focus:border-brand-primary"
                 value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label htmlFor="password" className="text-[11px] text-text-muted tracking-[0.04em] uppercase font-semibold">{t('auth.signUp.password')}</label>
          <input id="password" type="password" autoComplete="new-password" required minLength={8}
                 className="h-[38px] px-3 border border-border-strong rounded-radius-sm bg-surface text-text outline-none transition-colors duration-[120ms] focus:border-brand-primary"
                 value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <button
          className="w-full h-10 mt-1.5 bg-brand-primary text-brand-on-primary border-0 rounded-radius-sm font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          type="submit" disabled={submitting}
        >
          {submitting ? t('auth.signUp.submitting') : t('auth.signUp.submit')}
        </button>

        {error && <div className="mt-2.5 text-xs text-danger">{error}</div>}

        <div className="mt-[18px] text-center text-xs text-text-muted">
          {t('auth.signUp.hasAccount')} <Link to="/signin" className="text-brand-primary font-semibold">{t('auth.signUp.signIn')}</Link>
        </div>
      </form>
    </div>
  );
}

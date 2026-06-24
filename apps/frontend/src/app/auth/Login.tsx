import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../shared/api/services';
import { setTokens, landingForRole } from '../../shared/auth/tokens';
import { useSession } from '../../shared/theme/ThemeContext';

// Pre-login the user/tenant is unknown — auth always renders on a fixed,
// neutral-dark platform palette. Locally re-declared vars defeat any stale
// tenant vars left inline on :root and the [data-theme] neutral block.
const authWrapStyle = {
  '--bg': '#0E1116',
  '--surface': '#161A21',
  '--surface-2': '#0E1116',
  '--border': '#262B34',
  '--border-strong': '#2C323C',
  '--text': '#E6E9EF',
  '--text-muted': '#8B93A1',
  '--text-faint': '#5B626D',
  '--brand-primary': '#5B68E0',
  '--brand-primary-soft': 'rgba(91, 104, 224, 0.20)',
  '--brand-on-primary': '#FFFFFF',
  '--danger': '#E5707A',
  '--shadow-md': '0 18px 44px rgba(0, 0, 0, 0.5)',
  background:
    'radial-gradient(1200px 600px at 80% -10%, var(--brand-primary-soft), transparent 60%), var(--surface-2)',
} as React.CSSProperties;

export default function Login() {
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
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen grid place-items-center py-8 px-6"
      style={authWrapStyle}
    >
      <form
        className="w-full max-w-[380px] bg-surface border border-border rounded-radius shadow-md p-7"
        onSubmit={onSubmit}
      >
        <h1 className="text-[18px] font-bold tracking-[-0.01em] mt-0 mb-1 text-text">Sign in</h1>
        <p className="text-xs text-text-muted mt-0 mb-[22px]">Welcome back.</p>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label htmlFor="email" className="text-[11px] text-text-muted tracking-[0.04em] uppercase font-semibold">Email</label>
          <input id="email" type="email" autoComplete="email" required
                 className="h-[38px] px-3 border border-border-strong rounded-radius-sm bg-surface text-text outline-none transition-colors duration-[120ms] focus:border-brand-primary"
                 value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <label htmlFor="password" className="text-[11px] text-text-muted tracking-[0.04em] uppercase font-semibold">Password</label>
          <input id="password" type="password" autoComplete="current-password" required
                 className="h-[38px] px-3 border border-border-strong rounded-radius-sm bg-surface text-text outline-none transition-colors duration-[120ms] focus:border-brand-primary"
                 value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <button
          className="w-full h-10 mt-1.5 bg-brand-primary text-brand-on-primary border-0 rounded-radius-sm font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          type="submit" disabled={submitting}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        {error && <div className="mt-2.5 text-xs text-danger">{error}</div>}

        <div className="mt-[18px] text-center text-xs text-text-muted">
          No account? <Link to="/signup" className="text-brand-primary font-semibold">Create one</Link>
        </div>
      </form>
    </div>
  );
}

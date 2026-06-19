import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../shared/api/services';
import { setTokens, landingForRole } from '../../shared/auth/tokens';
import { useSession } from '../../shared/theme/ThemeContext';
import './AuthLayout.css';

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
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Sign in</h1>
        <p className="auth-sub">Welcome back.</p>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required
                 value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" required
                 value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <button className="auth-btn" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-footer">
          No account? <Link to="/signup">Create one</Link>
        </div>
      </form>
    </div>
  );
}

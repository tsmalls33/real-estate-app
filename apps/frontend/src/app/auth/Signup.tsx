import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../shared/api/services';
import { setTokens, landingForRole } from '../../shared/auth/tokens';
import { useSession } from '../../shared/theme/ThemeContext';
import './AuthLayout.css';

export default function Signup() {
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
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Create account</h1>
        <p className="auth-sub">Manage your properties in one place.</p>

        <div className="auth-field">
          <label htmlFor="firstName">First name</label>
          <input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>

        <div className="auth-field">
          <label htmlFor="lastName">Last name</label>
          <input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required
                 value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" required minLength={8}
                 value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <button className="auth-btn" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-footer">
          Already have one? <Link to="/signin">Sign in</Link>
        </div>
      </form>
    </div>
  );
}

import { useSession } from '../../shared/theme/ThemeContext';
import ThemeToggle from '../../shared/components/ThemeToggle/ThemeToggle';
import './Settings.css';

export default function Settings() {
  const { me } = useSession();
  return (
    <div className="cli-settings">
      <section className="cli-settings-card">
        <h3>Profile</h3>
        <p className="cli-settings-card-sub">Your account details.</p>
        <div className="cli-settings-row">
          <div className="cli-settings-row-label">Name</div>
          <div className="cli-settings-row-value">
            {[me?.firstName, me?.lastName].filter(Boolean).join(' ') || '—'}
          </div>
        </div>
        <div className="cli-settings-row">
          <div className="cli-settings-row-label">Email</div>
          <div className="cli-settings-row-value">{me?.email}</div>
        </div>
      </section>

      <section className="cli-settings-card">
        <h3>Appearance</h3>
        <p className="cli-settings-card-sub">Choose how the portal looks on this account.</p>
        <div className="cli-settings-row">
          <div className="cli-settings-row-label">Theme</div>
          <div className="cli-settings-row-value"><ThemeToggle /></div>
        </div>
      </section>
    </div>
  );
}

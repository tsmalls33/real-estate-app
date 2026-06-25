import { useSession } from '../../shared/theme/ThemeContext';
import ThemeToggle from '../../shared/components/ThemeToggle/ThemeToggle';

export default function Settings() {
  const { me } = useSession();
  return (
    <div className="grid gap-[18px] max-w-[640px]">
      <section className="bg-surface border border-border rounded-[14px] px-6 py-[22px]">
        <h3 className="text-sm font-bold tracking-[-0.01em] text-text mb-1 mt-0">Profile</h3>
        <p className="text-xs text-text-muted mt-0 mb-4">Your account details.</p>
        <div className="grid grid-cols-[140px_1fr] gap-3 items-center py-[10px] text-[13px] border-t border-border first-of-type:border-t-0 first-of-type:pt-0">
          <div className="text-text-muted text-[11px] tracking-[0.06em] uppercase font-semibold">Name</div>
          <div className="text-text">
            {[me?.firstName, me?.lastName].filter(Boolean).join(' ') || '—'}
          </div>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-3 items-center py-[10px] text-[13px] border-t border-border first-of-type:border-t-0 first-of-type:pt-0">
          <div className="text-text-muted text-[11px] tracking-[0.06em] uppercase font-semibold">Email</div>
          <div className="text-text">{me?.email}</div>
        </div>
      </section>

      <section className="bg-surface border border-border rounded-[14px] px-6 py-[22px]">
        <h3 className="text-sm font-bold tracking-[-0.01em] text-text mb-1 mt-0">Appearance</h3>
        <p className="text-xs text-text-muted mt-0 mb-4">Choose how the portal looks on this account.</p>
        <div className="grid grid-cols-[140px_1fr] gap-3 items-center py-[10px] text-[13px] border-t border-border first-of-type:border-t-0 first-of-type:pt-0">
          <div className="text-text-muted text-[11px] tracking-[0.06em] uppercase font-semibold">Theme</div>
          <div className="text-text"><ThemeToggle /></div>
        </div>
      </section>
    </div>
  );
}

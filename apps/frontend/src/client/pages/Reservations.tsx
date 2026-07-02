import { useTranslation } from 'react-i18next';

export default function Reservations() {
  const { t } = useTranslation();
  return (
    <div className="bg-surface border border-border rounded-[14px] p-[16px_18px] shadow-sm">
      <p className="text-[12px] text-text-muted">{t('client.dashboard.reservations')} — coming soon.</p>
    </div>
  );
}

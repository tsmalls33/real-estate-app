import { useTranslation } from 'react-i18next';
import type { OwnerKpis } from '@RealEstate/types';

interface Props {
  kpis: OwnerKpis;
}

const card =
  'bg-surface border border-border rounded-[14px] p-[16px_18px] shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md';

function DeltaPill({ pct, onDark = false }: { pct: number; onDark?: boolean }) {
  const { t } = useTranslation();
  const up = pct >= 0;
  const tone = onDark
    ? 'bg-white/15 text-white'
    : up
      ? 'bg-success-soft text-success'
      : 'bg-danger-soft text-danger';
  return (
    <span className={`inline-flex items-center gap-[3px] text-[10.5px] font-semibold px-[7px] py-[2px] rounded-full ${tone}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)}% <span className="font-medium opacity-80">{t('client.dashboard.vsLastMonth')}</span>
    </span>
  );
}

export default function OwnerKpiStrip({ kpis }: Props) {
  const { t } = useTranslation();
  const occupancy = Math.min(Math.max(kpis.nightsBooked.occupancyPct, 0), 100);

  return (
    <div className="grid grid-cols-4 max-card:grid-cols-2 gap-3">
      <div className={`${card} bg-gradient-to-br from-brand-primary to-[#1E2540] text-brand-on-primary border-transparent`}>
        <div className="text-[10px] uppercase tracking-[0.12em] font-semibold opacity-80">
          {t('client.dashboard.incomeLastMonth')}
        </div>
        <div className="text-[24px] font-bold mt-1 tracking-[-0.02em] tabular-nums">
          €{kpis.incomeLastMonth.amount.toLocaleString()}
        </div>
        <div className="mt-[6px]">
          <DeltaPill pct={kpis.incomeLastMonth.deltaPercent} onDark />
        </div>
      </div>

      <div className={card}>
        <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-text-muted">
          {t('client.dashboard.nightsBooked')}
        </div>
        <div className="text-[24px] font-bold mt-1 tracking-[-0.02em] tabular-nums">
          {kpis.nightsBooked.booked}{' '}
          <span className="text-text-muted text-[14px] font-medium">/ {kpis.nightsBooked.total}</span>
        </div>
        <div className="h-[4px] rounded-full bg-surface-2 mt-[9px] overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-secondary origin-left animate-[growX_0.7s_ease-out_both]"
            style={{ width: `${occupancy}%` }}
          />
        </div>
        <div className="text-[11px] mt-[5px] text-text-muted font-medium">
          {t('client.dashboard.occupancy', { pct: occupancy })}
        </div>
      </div>

      <div className={card}>
        <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-text-muted">
          {t('client.dashboard.avgNightly')}
        </div>
        <div className="text-[24px] font-bold mt-1 tracking-[-0.02em] tabular-nums">
          €{kpis.avgNightly.amount}
        </div>
        <div className="mt-[6px]">
          <DeltaPill pct={kpis.avgNightly.deltaPercent} />
        </div>
      </div>

      <div className={card}>
        <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-text-muted">
          {t('client.dashboard.nextPayout')}
        </div>
        <div className="text-[24px] font-bold mt-1 tracking-[-0.02em] tabular-nums">
          €{kpis.nextPayout.amount.toLocaleString()}
        </div>
        <div className="text-[11px] mt-[6px] text-text-muted font-medium">
          {kpis.nextPayout.date && new Date(kpis.nextPayout.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}
        </div>
      </div>
    </div>
  );
}

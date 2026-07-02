import { useTranslation } from 'react-i18next';
import type { OwnerKpis } from '@RealEstate/types';

interface Props {
  kpis: OwnerKpis;
}

export default function OwnerKpiStrip({ kpis }: Props) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-4 max-card:grid-cols-2 gap-3">
      <div className="bg-surface border border-border rounded-[14px] p-[16px_18px] shadow-sm bg-gradient-to-br from-brand-primary to-[#1E2540] text-brand-on-primary">
        <div className="text-[10px] uppercase tracking-[0.12em] font-semibold opacity-80">
          {t('client.dashboard.incomeLastMonth')}
        </div>
        <div className="text-[22px] font-bold mt-1 tracking-[-0.02em]">
          €{kpis.incomeLastMonth.amount.toLocaleString()}
        </div>
        <div className={`text-[11px] mt-[2px] font-medium ${kpis.incomeLastMonth.deltaPercent >= 0 ? 'text-green-300' : 'text-red-300'}`}>
          {kpis.incomeLastMonth.deltaPercent >= 0 ? '↑' : '↓'} {Math.abs(kpis.incomeLastMonth.deltaPercent)}% {t('client.dashboard.vsLastMonth')}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[14px] p-[16px_18px] shadow-sm">
        <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-text-muted">
          {t('client.dashboard.nightsBooked')}
        </div>
        <div className="text-[22px] font-bold mt-1 tracking-[-0.02em]">
          {kpis.nightsBooked.booked}{' '}
          <span className="text-text-muted text-[14px] font-medium">/ {kpis.nightsBooked.total}</span>
        </div>
        <div className="text-[11px] mt-[2px] text-text-muted font-medium">
          {t('client.dashboard.occupancy', { pct: kpis.nightsBooked.occupancyPct })}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[14px] p-[16px_18px] shadow-sm">
        <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-text-muted">
          {t('client.dashboard.avgNightly')}
        </div>
        <div className="text-[22px] font-bold mt-1 tracking-[-0.02em]">
          €{kpis.avgNightly.amount}
        </div>
        <div className={`text-[11px] mt-[2px] font-medium ${kpis.avgNightly.deltaPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {kpis.avgNightly.deltaPercent >= 0 ? '↑' : '↓'} €{Math.abs(kpis.avgNightly.deltaPercent)} {t('client.dashboard.vsLastMonth')}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[14px] p-[16px_18px] shadow-sm">
        <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-text-muted">
          {t('client.dashboard.nextPayout')}
        </div>
        <div className="text-[22px] font-bold mt-1 tracking-[-0.02em]">
          €{kpis.nextPayout.amount.toLocaleString()}
        </div>
        <div className="text-[11px] mt-[2px] text-text-muted font-medium">
          {kpis.nextPayout.date && new Date(kpis.nextPayout.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
}

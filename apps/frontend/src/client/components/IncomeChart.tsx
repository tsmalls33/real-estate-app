import { useTranslation } from 'react-i18next';
import type { IncomeChartItem } from '@RealEstate/types';

interface Props {
  data: IncomeChartItem[];
}

// Bars are stacked and sized in percentages so the chart fills the card height:
// the tallest month's stack reaches the top of the plot area, its baseline sits
// at the bottom, and everything stays proportional at any magnitude.
export default function IncomeChart({ data }: Props) {
  const { t, i18n } = useTranslation();
  const maxTotal = Math.max(...data.map((m) => m.airbnb + m.booking + m.other), 1);

  // month is 'YYYY-MM'; format the abbreviated month name in the active locale.
  const monthLabel = (month: string) => {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(i18n.language, { month: 'short' });
  };

  return (
    <div className="bg-surface border border-border rounded-[14px] p-[16px_18px] shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-text">
          {t('client.dashboard.incomeChart')}
        </span>
      </div>
      <div className="flex-1 flex flex-col min-h-[130px]">
        <div className="flex-1 flex items-end gap-[6px]">
          {data.map((month) => {
            const total = month.airbnb + month.booking + month.other;
            const pct = (v: number) => (total <= 0 ? 0 : (v / total) * 100);
            return (
              <div
                key={month.month}
                className="flex-1 flex flex-col-reverse rounded-t-[3px] overflow-hidden"
                style={{ height: `${(total / maxTotal) * 100}%` }}
              >
                <div style={{ height: `${pct(month.other)}%`, background: 'var(--brand-primary)' }} />
                <div style={{ height: `${pct(month.booking)}%`, background: '#2D4FB0' }} />
                <div style={{ height: `${pct(month.airbnb)}%`, background: '#FF6B5B' }} />
              </div>
            );
          })}
        </div>
        <div className="flex gap-[6px] mt-1">
          {data.map((month) => (
            <span key={month.month} className="flex-1 text-center text-[9px] text-text-muted">
              {monthLabel(month.month)}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-4 mt-3 justify-center">
        <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="w-[7px] h-[7px] rounded-full" style={{ background: '#FF6B5B' }} />
          {t('client.dashboard.channels.airbnb')}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="w-[7px] h-[7px] rounded-full" style={{ background: '#2D4FB0' }} />
          {t('client.dashboard.channels.booking')}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="w-[7px] h-[7px] rounded-full" style={{ background: 'var(--brand-primary)' }} />
          {t('client.dashboard.channels.direct')}
        </span>
      </div>
    </div>
  );
}

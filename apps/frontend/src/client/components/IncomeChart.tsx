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

  const legend = [
    { label: t('client.dashboard.channels.airbnb'), color: 'var(--channel-airbnb)' },
    { label: t('client.dashboard.channels.booking'), color: 'var(--channel-booking)' },
    { label: t('client.dashboard.channels.direct'), color: 'var(--brand-primary)' },
  ];

  return (
    <div className="bg-surface border border-border rounded-[14px] p-[16px_18px] shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-text">
          {t('client.dashboard.incomeChart')}
        </span>
      </div>
      <div className="flex-1 flex flex-col min-h-[130px]">
        <div className="flex-1 relative">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            {[25, 50, 75].map((y) => (
              <div key={y} className="absolute inset-x-0 h-px opacity-60" style={{ top: `${y}%`, background: 'var(--border)' }} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-end gap-[6px] border-b border-border">
            {data.map((month, i) => {
              const total = month.airbnb + month.booking + month.other;
              const pct = (v: number) => (total <= 0 ? 0 : (v / total) * 100);
              const tip = `€${total.toLocaleString()} — ${legend[0].label} €${month.airbnb.toLocaleString()} · ${legend[1].label} €${month.booking.toLocaleString()} · ${legend[2].label} €${month.other.toLocaleString()}`;
              if (total <= 0) {
                return (
                  <div key={month.month} className="flex-1 flex justify-center">
                    <span className="w-[14px] h-[3px] rounded-full bg-border mb-[2px]" title={tip} />
                  </div>
                );
              }
              return (
                <div
                  key={month.month}
                  title={tip}
                  className="flex-1 flex flex-col-reverse rounded-t-[6px] overflow-hidden origin-bottom animate-[growY_0.6s_cubic-bezier(0.22,1,0.36,1)_both] transition-[filter] duration-150 hover:brightness-110 cursor-default"
                  style={{ height: `${(total / maxTotal) * 100}%`, minHeight: '6px', animationDelay: `${i * 70}ms` }}
                >
                  <div style={{ height: `${pct(month.other)}%`, background: 'var(--brand-primary)' }} />
                  <div style={{ height: `${pct(month.booking)}%`, background: 'var(--channel-booking)' }} />
                  <div style={{ height: `${pct(month.airbnb)}%`, background: 'var(--channel-airbnb)' }} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-[6px] mt-[6px]">
          {data.map((month) => (
            <span key={month.month} className="flex-1 text-center text-[9px] text-text-muted">
              {monthLabel(month.month)}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-4 mt-3 justify-center">
        {legend.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <span className="w-[7px] h-[7px] rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

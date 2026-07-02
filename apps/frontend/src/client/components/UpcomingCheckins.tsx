import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UpcomingCheckin } from '@RealEstate/types';
import ScrollFade from '../../shared/components/ScrollFade/ScrollFade';
import ChannelBadge from '../../shared/components/ChannelBadge/ChannelBadge';

interface Props {
  checkins: UpcomingCheckin[];
}

export default function UpcomingCheckins({ checkins }: Props) {
  const { t, i18n } = useTranslation();

  // "in 4 days" / "tomorrow", localized for free via Intl — no i18n keys needed.
  // Whole UTC calendar days (consistent with the UTC date chip) so the label
  // never flips with time of day. Captured once per mount (react-hooks/purity).
  const [today] = useState(() => new Date());
  const utcDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const relative = (checkIn: string) => {
    const days = Math.round((utcDay(new Date(checkIn)) - utcDay(today)) / 86400000);
    return new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' }).format(days, 'day');
  };

  if (checkins.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-[14px] p-[16px_18px] shadow-sm h-full">
        <div className="text-[13px] font-semibold text-text mb-2">
          {t('client.dashboard.upcomingCheckins')}
        </div>
        <p className="text-[12px] text-text-muted">{t('client.dashboard.noCheckins')}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-[14px] p-[16px_18px] shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-text">
          {t('client.dashboard.upcomingCheckins')}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ScrollFade orientation="vertical" className="space-y-1" fadeColor="var(--surface)">
          {checkins.map((c) => {
            const day = new Date(c.checkIn).getUTCDate();
            const month = new Date(c.checkIn).toLocaleDateString(i18n.language, { month: 'short', timeZone: 'UTC' });
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 py-2 px-[8px] -mx-[8px] rounded-[10px] border-b border-border last:border-b-0 transition-colors hover:bg-hover"
              >
                <div className="flex flex-col items-center justify-center w-[40px] py-[4px] flex-shrink-0 rounded-[9px] bg-surface-2 border border-border">
                  <span className="text-[15px] font-bold text-text leading-none tabular-nums">{day}</span>
                  <span className="text-[8.5px] text-text-muted uppercase tracking-[0.08em] mt-[2px]">{month}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-text truncate">{c.guestName}</div>
                  <div className="text-[11px] text-text-muted truncate">
                    {c.propertyName} · {t('client.dashboard.nights', { n: c.nights })}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-[4px] flex-shrink-0">
                  <ChannelBadge channel={c.channel} />
                  <span className="text-[9.5px] text-text-faint">{relative(c.checkIn)}</span>
                </div>
              </div>
            );
          })}
        </ScrollFade>
      </div>
    </div>
  );
}

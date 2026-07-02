import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UpcomingCheckin } from '@RealEstate/types';
import ScrollFade from '../../shared/components/ScrollFade/ScrollFade';

interface Props {
  checkins: UpcomingCheckin[];
}

const CHANNEL_VARS: Record<string, string> = {
  AIRBNB: 'var(--channel-airbnb)',
  BOOKING: 'var(--channel-booking)',
  OTHER: 'var(--text-muted)',
};

const CHANNEL_KEYS: Record<string, string> = {
  AIRBNB: 'airbnb',
  BOOKING: 'booking',
  OTHER: 'direct',
};

export default function UpcomingCheckins({ checkins }: Props) {
  const { t, i18n } = useTranslation();
  const channelLabel = (channel: string) =>
    t(`client.dashboard.channels.${CHANNEL_KEYS[channel] ?? 'direct'}`);

  // "in 4 days" / "tomorrow", localized for free via Intl — no i18n keys needed.
  // Captured once per mount so render stays pure (react-hooks/purity).
  const [now] = useState(() => Date.now());
  const relative = (checkIn: string) => {
    const days = Math.round((new Date(checkIn).getTime() - now) / 86400000);
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
          {checkins.map((c, i) => {
            const day = new Date(c.checkIn).getUTCDate();
            const month = new Date(c.checkIn).toLocaleDateString(i18n.language, { month: 'short', timeZone: 'UTC' });
            const accent = CHANNEL_VARS[c.channel] ?? CHANNEL_VARS.OTHER;
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 py-2 px-[8px] -mx-[8px] rounded-[10px] border-b border-border last:border-b-0 transition-colors hover:bg-hover animate-[rise_0.35s_ease-out_both]"
                style={{ animationDelay: `${i * 50}ms` }}
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
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: accent, background: `color-mix(in srgb, ${accent} 12%, transparent)` }}
                  >
                    {channelLabel(c.channel)}
                  </span>
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

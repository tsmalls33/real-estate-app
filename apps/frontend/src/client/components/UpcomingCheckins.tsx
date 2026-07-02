import { useTranslation } from 'react-i18next';
import type { UpcomingCheckin } from '@RealEstate/types';
import ScrollFade from '../../shared/components/ScrollFade/ScrollFade';

interface Props {
  checkins: UpcomingCheckin[];
}

const CHANNEL_COLORS: Record<string, string> = {
  AIRBNB: 'bg-[#FF5A5F]/10 text-[#FF5A5F]',
  BOOKING: 'bg-[#003580]/10 text-[#003580]',
  OTHER: 'bg-hover text-text-muted',
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
        <ScrollFade orientation="vertical" className="space-y-2" fadeColor="var(--surface)">
          {checkins.map((c) => {
            const day = new Date(c.checkIn).getUTCDate();
            const month = new Date(c.checkIn).toLocaleDateString(i18n.language, { month: 'short', timeZone: 'UTC' });
            return (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
                <div className="flex flex-col items-center w-[36px] flex-shrink-0">
                  <span className="text-[16px] font-bold text-text leading-none">{day}</span>
                  <span className="text-[9px] text-text-muted uppercase mt-[1px]">{month}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-text truncate">{c.guestName}</div>
                  <div className="text-[11px] text-text-muted truncate">
                    {c.propertyName} · {t('client.dashboard.nights', { n: c.nights })}
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CHANNEL_COLORS[c.channel] ?? CHANNEL_COLORS.OTHER}`}>
                  {channelLabel(c.channel)}
                </span>
              </div>
            );
          })}
        </ScrollFade>
      </div>
    </div>
  );
}

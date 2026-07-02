// Single source of truth for booking-channel presentation. Colors are the
// mode-aware vars from tokens.css so chart segments, legends, and badges
// always agree with each other and with dark mode.
export interface ChannelMeta {
  color: string;
  labelKey: string;
}

export const CHANNELS: Record<string, ChannelMeta> = {
  AIRBNB: { color: 'var(--channel-airbnb)', labelKey: 'client.dashboard.channels.airbnb' },
  BOOKING: { color: 'var(--channel-booking)', labelKey: 'client.dashboard.channels.booking' },
  OTHER: { color: 'var(--brand-primary)', labelKey: 'client.dashboard.channels.direct' },
};

export const channelMeta = (channel: string): ChannelMeta => CHANNELS[channel] ?? CHANNELS.OTHER;

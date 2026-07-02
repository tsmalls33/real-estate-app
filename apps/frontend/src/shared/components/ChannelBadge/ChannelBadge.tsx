import { useTranslation } from 'react-i18next';
import { channelMeta } from './channels';

interface Props {
  channel: string;
}

export default function ChannelBadge({ channel }: Props) {
  const { t } = useTranslation();
  const meta = channelMeta(channel);
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ color: meta.color, background: `color-mix(in srgb, ${meta.color} 12%, transparent)` }}
    >
      {t(meta.labelKey)}
    </span>
  );
}

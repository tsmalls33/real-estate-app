import { useTranslation } from 'react-i18next';
import { ThemeMode } from '@RealEstate/types';
import { useSession } from '../../theme/ThemeContext';
import { focusRing } from '../../styles/focusRing';

const OPTIONS: { value: ThemeMode; labelKey: string }[] = [
  { value: ThemeMode.LIGHT, labelKey: 'theme.light' },
  { value: ThemeMode.DARK, labelKey: 'theme.dark' },
  { value: ThemeMode.SYSTEM, labelKey: 'theme.system' },
];

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { mode, setMode } = useSession();
  return (
    <div
      className="inline-flex gap-[2px] rounded-radius-sm border border-border bg-surface-2 p-[3px]"
      role="group"
      aria-label={t('theme.label')}
    >
      {OPTIONS.map(o => (
        <button
          key={o.value}
          type="button"
          className={`cursor-pointer rounded-[5px] border-0 px-[14px] py-[6px] text-xs font-semibold transition-colors duration-[120ms] ease-[ease] ${focusRing} ${
            mode === o.value
              ? 'bg-surface text-text shadow-sm'
              : 'bg-transparent text-text-muted hover:text-text'
          }`}
          aria-pressed={mode === o.value}
          onClick={() => setMode(o.value)}
        >
          {t(o.labelKey)}
        </button>
      ))}
    </div>
  );
}

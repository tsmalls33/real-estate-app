import { useTranslation } from 'react-i18next';
import { Language } from '@RealEstate/types';
import { useLanguage } from '../../i18n/LanguageContext';

type Variant = 'default' | 'flags';

type FlagContent = string | React.ReactElement;

const FLAGS: Record<string, FlagContent> = {
  [Language.EN]: '\u{1F1FA}\u{1F1F8}',
  [Language.ES]: '\u{1F1EA}\u{1F1F8}',
  [Language.CA]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16" style={{ width: '1em', height: 'auto', verticalAlign: 'middle' }}>
      <rect width="24" height="16" fill="#FCDD09"/>
      <rect y="0" width="24" height="2.3" fill="#DA121A"/>
      <rect y="4.6" width="24" height="2.3" fill="#DA121A"/>
      <rect y="9.2" width="24" height="2.3" fill="#DA121A"/>
      <rect y="13.8" width="24" height="2.3" fill="#DA121A"/>
    </svg>
  ),
};

const OPTIONS: { value: Language; labelKey: string; flag: FlagContent }[] = [
  { value: Language.EN, labelKey: 'language.en', flag: FLAGS[Language.EN] },
  { value: Language.ES, labelKey: 'language.es', flag: FLAGS[Language.ES] },
  { value: Language.CA, labelKey: 'language.ca', flag: FLAGS[Language.CA] },
];

type Props = {
  variant?: Variant;
};

export default function LanguageToggle({ variant = 'default' }: Props) {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  return (
    <div
      className="inline-flex gap-[2px] rounded-radius-sm border border-border bg-surface-2 p-[3px]"
      role="group"
      aria-label={t('settings.language.label')}
    >
      {OPTIONS.map(o => (
        <button
          key={o.value}
          type="button"
          className={`cursor-pointer rounded-[5px] border-0 text-xs font-semibold transition-colors duration-[120ms] ease-[ease] ${
            language === o.value
              ? 'bg-surface text-text shadow-sm'
              : 'bg-transparent text-text-muted hover:text-text'
          } ${variant === 'flags' ? 'px-[10px] py-[4px] text-base leading-none' : 'px-[14px] py-[6px]'}`}
          aria-pressed={language === o.value}
          aria-label={t(o.labelKey)}
          onClick={() => setLanguage(o.value)}
        >
          {variant === 'flags' ? o.flag : t(o.labelKey)}
        </button>
      ))}
    </div>
  );
}

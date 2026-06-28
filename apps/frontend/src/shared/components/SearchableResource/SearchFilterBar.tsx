import { useTranslation } from 'react-i18next';
import type { ResourceSearchConfig, SearchFilterValue } from './types';

interface Props {
  config: ResourceSearchConfig;
  value: SearchFilterValue;
  onChange: (next: SearchFilterValue) => void;
}

const TAB_BASE =
  'text-sm font-semibold px-3 pt-2 pb-2.5 text-text-muted hover:text-text transition-colors';
const TAB_ACTIVE = 'text-brand-secondary shadow-[inset_0_-2px_0_0_var(--brand-secondary)]';

// Entity-agnostic search + filter bar. Controlled: `value` in, `onChange` out.
// Owns no URL or fetch logic — SearchableResource drives those.
export default function SearchFilterBar({ config, value, onChange }: Props) {
  const { t } = useTranslation();

  const anyActive =
    value.q.trim() !== '' || config.filterGroups.some(group => value[group.param]);

  const setParam = (param: string, next: string) => onChange({ ...value, [param]: next });

  const reset = () => {
    const cleared: SearchFilterValue = { q: '' };
    for (const group of config.filterGroups) cleared[group.param] = '';
    onChange(cleared);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2 mb-4">
      {config.filterGroups.map(group => {
        const active = value[group.param] ?? '';
        return (
          <div key={group.param} className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              aria-pressed={active === ''}
              onClick={() => setParam(group.param, '')}
              className={`${TAB_BASE} ${active === '' ? TAB_ACTIVE : ''}`}
            >
              {t(group.allLabelKey)}
            </button>
            {group.options.map(option => (
              <button
                key={option.value}
                type="button"
                aria-pressed={active === option.value}
                onClick={() => setParam(group.param, option.value)}
                className={`${TAB_BASE} ${active === option.value ? TAB_ACTIVE : ''}`}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        );
      })}

      <label className="relative flex items-center ml-auto max-card:ml-0 max-card:w-full">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-2.5 w-3.5 h-3.5 text-text-faint pointer-events-none"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={value.q}
          onChange={event => onChange({ ...value, q: event.target.value })}
          placeholder={t(config.searchPlaceholderKey)}
          aria-label={t(config.searchPlaceholderKey)}
          className="w-52 max-card:w-full text-sm text-text bg-surface border border-border rounded-full pl-8 pr-3 py-1.5 outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary-soft placeholder:text-text-faint"
        />
      </label>

      {anyActive && (
        <button
          type="button"
          onClick={reset}
          className="ml-1 text-xs font-semibold text-text-muted hover:text-text px-2 py-1 rounded-radius-sm hover:bg-hover"
        >
          {t(config.resetLabelKey)}
        </button>
      )}
    </div>
  );
}

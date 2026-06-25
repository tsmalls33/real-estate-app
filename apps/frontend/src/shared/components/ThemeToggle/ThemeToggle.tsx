import { ThemeMode } from '@RealEstate/types';
import { useSession } from '../../theme/ThemeContext';

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: ThemeMode.LIGHT, label: 'Light' },
  { value: ThemeMode.DARK, label: 'Dark' },
  { value: ThemeMode.SYSTEM, label: 'System' },
];

export default function ThemeToggle() {
  const { mode, setMode } = useSession();
  return (
    <div
      className="inline-flex gap-[2px] rounded-radius-sm border border-border bg-surface-2 p-[3px]"
      role="group"
      aria-label="Theme mode"
    >
      {OPTIONS.map(o => (
        <button
          key={o.value}
          type="button"
          className={`cursor-pointer rounded-[5px] border-0 px-[14px] py-[6px] text-xs font-semibold transition-colors duration-[120ms] ease-[ease] ${
            mode === o.value
              ? 'bg-surface text-text shadow-sm'
              : 'bg-transparent text-text-muted hover:text-text'
          }`}
          aria-pressed={mode === o.value}
          onClick={() => setMode(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

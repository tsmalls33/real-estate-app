import { ThemeMode } from '@RealEstate/types';
import { useSession } from '../../theme/ThemeContext';
import './ThemeToggle.css';

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: ThemeMode.LIGHT, label: 'Light' },
  { value: ThemeMode.DARK, label: 'Dark' },
  { value: ThemeMode.SYSTEM, label: 'System' },
];

export default function ThemeToggle() {
  const { mode, setMode } = useSession();
  return (
    <div className="theme-toggle" role="group" aria-label="Theme mode">
      {OPTIONS.map(o => (
        <button
          key={o.value}
          type="button"
          className={`theme-toggle-opt ${mode === o.value ? 'active' : ''}`}
          aria-pressed={mode === o.value}
          onClick={() => setMode(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

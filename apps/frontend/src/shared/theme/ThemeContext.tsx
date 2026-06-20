import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { MeResponse } from '@RealEstate/types';
import { ThemeMode } from '@RealEstate/types';
import { userApi } from '../api/services';
import { getAccessToken } from '../auth/tokens';

const THEME_MODE_KEY = 'theme-mode';

type Ctx = {
  me: MeResponse | null;
  loading: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  refresh: () => Promise<void>;
};

const SessionCtx = createContext<Ctx>({
  me: null,
  loading: true,
  mode: ThemeMode.SYSTEM,
  setMode: () => {},
  refresh: async () => {},
});

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined'
    && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

// Resolve the stored preference to the concrete light/dark variant to render.
function effectiveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === ThemeMode.SYSTEM) return systemPrefersDark() ? 'dark' : 'light';
  return mode === ThemeMode.DARK ? 'dark' : 'light';
}

function readStoredMode(): ThemeMode {
  const v = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_MODE_KEY) : null;
  return v === ThemeMode.LIGHT || v === ThemeMode.DARK || v === ThemeMode.SYSTEM
    ? (v as ThemeMode)
    : ThemeMode.SYSTEM;
}

function parseHex(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '');
  const expanded = cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned;
  return [
    parseInt(expanded.slice(0, 2), 16),
    parseInt(expanded.slice(2, 4), 16),
    parseInt(expanded.slice(4, 6), 16),
  ];
}

function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mix(hex: string, towards: [number, number, number], ratio: number): string {
  const [r, g, b] = parseHex(hex);
  const m = (a: number, b: number) => Math.round(a * (1 - ratio) + b * ratio);
  const to = (n: number) => n.toString(16).padStart(2, '0');
  return `#${to(m(r, towards[0]))}${to(m(g, towards[1]))}${to(m(b, towards[2]))}`;
}

const SIDEBAR_VARS = [
  '--bg',
  '--brand-primary',
  '--brand-secondary',
  '--brand-primary-soft',
  '--brand-secondary-soft',
  '--sidebar-bg',
  '--sidebar-border',
  '--sidebar-text',
];

function applyTheme(me: MeResponse | null, mode: ThemeMode): void {
  const root = document.documentElement;
  // CSS-owned neutral tokens swap via this attribute (see tokens.css).
  root.dataset.theme = effectiveMode(mode);

  const theme = me?.tenant?.theme;
  if (!theme) {
    SIDEBAR_VARS.forEach(v => root.style.removeProperty(v));
    return;
  }

  if (effectiveMode(mode) === 'dark') {
    // Dark variant of the tenant brand: keep hue, lift lightness so brand reads
    // on dark surfaces; background/surfaces go near-black tinted toward brand.
    // (RGB mix shifts hue slightly — acceptable for v1, see #68.)
    const primary = mix(theme.brandColor, [255, 255, 255], 0.34);
    const secondary = mix(theme.secondaryColor, [255, 255, 255], 0.30);
    root.style.setProperty('--bg', mix(theme.brandColor, [14, 17, 22], 0.9));
    root.style.setProperty('--brand-primary', primary);
    root.style.setProperty('--brand-secondary', secondary);
    root.style.setProperty('--brand-primary-soft', hexToRgba(primary, 0.16));
    root.style.setProperty('--brand-secondary-soft', hexToRgba(secondary, 0.2));
    root.style.setProperty('--sidebar-bg', mix(theme.brandColor, [9, 11, 15], 0.84));
    root.style.setProperty('--sidebar-border', mix(theme.brandColor, [42, 48, 58], 0.72));
    root.style.setProperty('--sidebar-text', mix(theme.brandColor, [255, 255, 255], 0.7));
    return;
  }

  root.style.setProperty('--bg', theme.backgroundColor);
  root.style.setProperty('--brand-primary', theme.brandColor);
  root.style.setProperty('--brand-secondary', theme.secondaryColor);
  root.style.setProperty('--brand-primary-soft', hexToRgba(theme.brandColor, 0.08));
  root.style.setProperty('--brand-secondary-soft', hexToRgba(theme.secondaryColor, 0.12));
  // Sidebar derives from the brand color so each tenant gets matching chrome.
  root.style.setProperty('--sidebar-bg', mix(theme.brandColor, [0, 0, 0], 0.78));
  root.style.setProperty('--sidebar-border', mix(theme.brandColor, [0, 0, 0], 0.65));
  root.style.setProperty('--sidebar-text', mix(theme.brandColor, [255, 255, 255], 0.62));
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);

  const refresh = useCallback(async () => {
    if (!getAccessToken()) {
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      const next = await userApi.me();
      setMe(next);
      // DB is the source of truth for the preference; mirror it locally.
      setModeState(next.preferredThemeMode);
      localStorage.setItem(THEME_MODE_KEY, next.preferredThemeMode);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    localStorage.setItem(THEME_MODE_KEY, next);
    if (getAccessToken()) {
      userApi.updateThemeMode(next).catch(() => {});
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-derive applied vars whenever the session or the chosen mode changes.
  useEffect(() => {
    applyTheme(me, mode);
  }, [me, mode]);

  const value = useMemo(
    () => ({ me, loading, mode, setMode, refresh }),
    [me, loading, mode, setMode, refresh],
  );
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession(): Ctx {
  return useContext(SessionCtx);
}

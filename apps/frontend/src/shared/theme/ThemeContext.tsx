import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { MeResponse } from '@RealEstate/types';
import { ThemeMode } from '@RealEstate/types';
import { authApi, userApi } from '../api/services';
import { clearTokens, getAccessToken, getRefreshToken } from '../auth/tokens';

const THEME_MODE_KEY = 'theme-mode';

type Ctx = {
  me: MeResponse | null;
  loading: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  logout: () => void;
  refresh: () => Promise<void>;
};

const SessionCtx = createContext<Ctx>({
  me: null,
  loading: true,
  mode: ThemeMode.SYSTEM,
  setMode: () => {},
  logout: () => {},
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

// Vars set inline per tenant (brand accents + page bg). Removed for non-tenant
// users so the neutral CSS defaults apply. The sidebar chrome is fixed neutral
// CSS (tokens.css), NOT brand-derived — brand only appears as UI accents.
const TENANT_VARS = [
  '--bg',
  '--brand-primary',
  '--brand-secondary',
  '--brand-primary-soft',
  '--brand-secondary-soft',
];

function applyTheme(me: MeResponse | null, mode: ThemeMode): void {
  const root = document.documentElement;
  // CSS-owned neutral tokens swap via this attribute (see tokens.css).
  root.dataset.theme = effectiveMode(mode);

  const theme = me?.tenant?.theme;
  if (!theme) {
    TENANT_VARS.forEach(v => root.style.removeProperty(v));
    return;
  }

  // Brand colors are tenant identity — IDENTICAL in light and dark, used only as
  // accents (brand mark, avatar, active indicator). The sidebar chrome and all
  // surfaces/text/borders are fixed neutral CSS that flips via [data-theme].
  // Only the page background is tenant-driven, and only in light mode.
  root.style.setProperty('--brand-primary', theme.brandColor);
  root.style.setProperty('--brand-secondary', theme.secondaryColor);
  root.style.setProperty('--brand-primary-soft', hexToRgba(theme.brandColor, 0.08));
  root.style.setProperty('--brand-secondary-soft', hexToRgba(theme.secondaryColor, 0.12));

  if (effectiveMode(mode) === 'dark') {
    // Dark background comes from the neutral token block; don't pin the light bg.
    root.style.removeProperty('--bg');
  } else {
    root.style.setProperty('--bg', theme.backgroundColor);
  }
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

  // Logout clears auth + tenant vars (me -> null re-applies the neutral base via
  // the effect below) but preserves the theme-mode preference in localStorage.
  const logout = useCallback(() => {
    // Best-effort server-side revocation (#42): capture the refresh token BEFORE
    // clearing, then fire-and-forget. Local state clears regardless of outcome.
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }
    clearTokens();
    setMe(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-derive applied vars whenever the session or the chosen mode changes.
  useEffect(() => {
    applyTheme(me, mode);
  }, [me, mode]);

  // While following the OS, re-apply when the system preference flips.
  useEffect(() => {
    if (mode !== ThemeMode.SYSTEM) return;
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq?.addEventListener) return;
    const handler = () => applyTheme(me, mode);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode, me]);

  const value = useMemo(
    () => ({ me, loading, mode, setMode, logout, refresh }),
    [me, loading, mode, setMode, logout, refresh],
  );
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession(): Ctx {
  return useContext(SessionCtx);
}

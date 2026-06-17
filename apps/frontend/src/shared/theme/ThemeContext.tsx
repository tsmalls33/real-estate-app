import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { MeResponse } from '@RealEstate/types';
import { userApi } from '../api/services';
import { getAccessToken } from '../auth/tokens';

type Ctx = {
  me: MeResponse | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SessionCtx = createContext<Ctx>({ me: null, loading: true, refresh: async () => {} });

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

function applyTheme(me: MeResponse | null): void {
  const root = document.documentElement;
  const theme = me?.tenant?.theme;
  if (!theme) {
    SIDEBAR_VARS.forEach(v => root.style.removeProperty(v));
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

  const refresh = useCallback(async () => {
    if (!getAccessToken()) {
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      const next = await userApi.me();
      setMe(next);
      applyTheme(next);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ me, loading, refresh }), [me, loading, refresh]);
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession(): Ctx {
  return useContext(SessionCtx);
}

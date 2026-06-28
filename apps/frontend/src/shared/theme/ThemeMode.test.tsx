import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeMode, UserRoles } from '@RealEstate/types';

vi.mock('../api/services', () => ({
  userApi: { me: vi.fn(), updateThemeMode: vi.fn(() => Promise.resolve()) },
  propertyApi: { list: vi.fn() },
  tenantApi: { list: vi.fn(), updateTheme: vi.fn(), assignTheme: vi.fn() },
  authApi: { signin: vi.fn(), signup: vi.fn(), logout: vi.fn().mockResolvedValue(undefined) },
}));

import { userApi } from '../api/services';
import { seedAuth, clearAuth } from '../../test-utils/auth';
import { makeMe, makeTenantSummary, SAMPLE_THEME } from '../../test-utils/factories';
import { SessionProvider, useSession } from './ThemeContext';

const root = () => document.documentElement;
const cssVar = (v: string) => root().style.getPropertyValue(v);

function ModeProbe() {
  const { mode, setMode, logout, loading } = useSession();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="theme">{root().dataset.theme ?? ''}</div>
      <button onClick={() => setMode(ThemeMode.DARK)}>dark</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

const renderProvider = () =>
  render(
    <SessionProvider>
      <ModeProbe />
    </SessionProvider>,
  );

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
  localStorage.removeItem('theme-mode');
  root().removeAttribute('data-theme');
  ['--bg', '--brand-primary'].forEach(v => root().style.removeProperty(v));
});

describe('theme mode', () => {
  it('persists DARK to localStorage + API and flips data-theme', async () => {
    seedAuth(UserRoles.ADMIN);
    vi.mocked(userApi.me).mockResolvedValue(
      makeMe({ tenant: makeTenantSummary({ theme: SAMPLE_THEME }) }),
    );
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await userEvent.click(screen.getByRole('button', { name: 'dark' }));

    await waitFor(() => expect(root().dataset.theme).toBe('dark'));
    expect(localStorage.getItem('theme-mode')).toBe('DARK');
    expect(userApi.updateThemeMode).toHaveBeenCalledWith('DARK');
  });

  it('keeps the tenant brand hex and drops --bg in dark mode', async () => {
    seedAuth(UserRoles.ADMIN);
    vi.mocked(userApi.me).mockResolvedValue(
      makeMe({
        preferredThemeMode: ThemeMode.DARK,
        tenant: makeTenantSummary({ theme: SAMPLE_THEME }),
      }),
    );
    renderProvider();
    await waitFor(() => expect(cssVar('--brand-primary')).toBe(SAMPLE_THEME.brandColor));

    expect(root().dataset.theme).toBe('dark');
    expect(cssVar('--bg')).toBe(''); // dark bg comes from the CSS neutral block
  });

  it('logout clears tenant vars but preserves the mode preference', async () => {
    seedAuth(UserRoles.ADMIN);
    vi.mocked(userApi.me).mockResolvedValue(
      makeMe({ tenant: makeTenantSummary({ theme: SAMPLE_THEME }) }),
    );
    renderProvider();
    await waitFor(() => expect(cssVar('--brand-primary')).toBe(SAMPLE_THEME.brandColor));

    await userEvent.click(screen.getByRole('button', { name: 'dark' }));
    expect(localStorage.getItem('theme-mode')).toBe('DARK');

    await userEvent.click(screen.getByRole('button', { name: 'logout' }));
    await waitFor(() => expect(cssVar('--brand-primary')).toBe(''));
    expect(localStorage.getItem('theme-mode')).toBe('DARK');
  });
});

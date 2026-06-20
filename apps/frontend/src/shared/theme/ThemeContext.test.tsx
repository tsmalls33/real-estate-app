import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserRoles } from '@RealEstate/types';

vi.mock('../api/services', () => ({
  userApi: { me: vi.fn() },
  propertyApi: { list: vi.fn() },
  tenantApi: { list: vi.fn(), updateTheme: vi.fn(), assignTheme: vi.fn() },
  authApi: { signin: vi.fn(), signup: vi.fn() },
}));

import { userApi } from '../api/services';
import { seedAuth, clearAuth } from '../../test-utils/auth';
import { makeMe, makeTenantSummary, SAMPLE_THEME } from '../../test-utils/factories';
import { SessionProvider, useSession } from './ThemeContext';

const CSS_VARS = [
  '--bg',
  '--brand-primary',
  '--brand-secondary',
  '--brand-primary-soft',
  '--brand-secondary-soft',
];

function brandVar() {
  return document.documentElement.style.getPropertyValue('--brand-primary');
}

function Probe() {
  const { me, loading, refresh } = useSession();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="me">{me ? me.email : 'null'}</div>
      <button onClick={() => refresh()}>refresh</button>
    </div>
  );
}

const renderProvider = () =>
  render(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
  CSS_VARS.forEach(v => document.documentElement.style.removeProperty(v));
});

describe('SessionProvider', () => {
  it('settles to me=null and applies no theme when there is no token', async () => {
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('me')).toHaveTextContent('null');
    expect(brandVar()).toBe('');
    expect(userApi.me).not.toHaveBeenCalled();
  });

  it('applies tenant theme CSS vars for a valid session', async () => {
    seedAuth(UserRoles.ADMIN);
    vi.mocked(userApi.me).mockResolvedValue(
      makeMe({ tenant: makeTenantSummary({ theme: SAMPLE_THEME }) }),
    );

    renderProvider();
    await waitFor(() => expect(brandVar()).toBe(SAMPLE_THEME.brandColor));
    expect(document.documentElement.style.getPropertyValue('--bg')).toBe(SAMPLE_THEME.backgroundColor);
  });

  it('re-applies the theme when refresh() returns new data', async () => {
    seedAuth(UserRoles.ADMIN);
    vi.mocked(userApi.me).mockResolvedValue(
      makeMe({ tenant: makeTenantSummary({ theme: { ...SAMPLE_THEME, brandColor: '#111111' } }) }),
    );

    renderProvider();
    await waitFor(() => expect(brandVar()).toBe('#111111'));

    vi.mocked(userApi.me).mockResolvedValue(
      makeMe({ tenant: makeTenantSummary({ theme: { ...SAMPLE_THEME, brandColor: '#222222' } }) }),
    );
    await userEvent.click(screen.getByRole('button', { name: /refresh/i }));
    await waitFor(() => expect(brandVar()).toBe('#222222'));
  });

  it('removes previously-applied CSS vars when the tenant has no theme', async () => {
    seedAuth(UserRoles.ADMIN);
    vi.mocked(userApi.me).mockResolvedValue(
      makeMe({ tenant: makeTenantSummary({ theme: SAMPLE_THEME }) }),
    );
    renderProvider();
    await waitFor(() => expect(brandVar()).toBe(SAMPLE_THEME.brandColor));

    vi.mocked(userApi.me).mockResolvedValue(makeMe({ tenant: makeTenantSummary({ theme: null }) }));
    await userEvent.click(screen.getByRole('button', { name: /refresh/i }));
    await waitFor(() => expect(brandVar()).toBe(''));
    CSS_VARS.forEach(v => expect(document.documentElement.style.getPropertyValue(v)).toBe(''));
  });
});

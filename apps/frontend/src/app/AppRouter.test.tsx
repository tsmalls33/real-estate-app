import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { UserRoles } from '@RealEstate/types';

const translations: Record<string, string> = {
  'auth.signIn.title': 'Sign in',
  'shell.welcomeBack': 'Welcome back, {{name}}',
  'shell.welcomeBackGeneric': 'Welcome back',
  'errors.404.title': '404 — Not found',
  'common.loading': 'Loading…',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      let val = translations[key] ?? key;
      if (options) {
        Object.entries(options).forEach(([k, v]) => { val = val.replace(`{{${k}}}`, v); });
      }
      return val;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

vi.mock('../shared/api/services', () => ({
  userApi: { me: vi.fn() },
  propertyApi: { list: vi.fn() },
  tenantApi: { list: vi.fn(), updateTheme: vi.fn(), assignTheme: vi.fn() },
  authApi: { signin: vi.fn(), signup: vi.fn() },
}));

import { userApi, propertyApi } from '../shared/api/services';
import { seedAuth, clearAuth } from '../test-utils/auth';
import { makeMe } from '../test-utils/factories';
import { renderWithSession } from '../test-utils/render';
import AppRouter from './AppRouter';

// Admin landing renders the admin Dashboard, which fires propertyApi.list();
// the client landing renders the client Dashboard, which also fires it. Resolve
// it for every test so the app-level ErrorBoundary never trips.
beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
  vi.mocked(propertyApi.list).mockResolvedValue({ properties: [], total: 0 });
});

const onAdmin = () => screen.findByRole('link', { name: /dashboard/i }); // admin-only nav label
const onClient = () => screen.findByText(/welcome back/i); // client shell greeting

describe('AppRouter guards', () => {
  it('redirects an unauthed user from a protected route to /signin', async () => {
    renderWithSession(<AppRouter />, { route: '/admin' });
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('redirects a CLIENT away from /admin to the client landing', async () => {
    seedAuth(UserRoles.CLIENT);
    vi.mocked(userApi.me).mockResolvedValue(makeMe({ role: UserRoles.CLIENT }));
    renderWithSession(<AppRouter />, { route: '/admin' });
    expect(await onClient()).toBeInTheDocument();
  });

  it('redirects an ADMIN away from /client to the admin landing', async () => {
    seedAuth(UserRoles.ADMIN);
    vi.mocked(userApi.me).mockResolvedValue(makeMe({ role: UserRoles.ADMIN }));
    renderWithSession(<AppRouter />, { route: '/client' });
    expect(await onAdmin()).toBeInTheDocument();
  });

  it('sends an authed user hitting / to their role landing', async () => {
    seedAuth(UserRoles.CLIENT);
    vi.mocked(userApi.me).mockResolvedValue(makeMe({ role: UserRoles.CLIENT }));
    renderWithSession(<AppRouter />, { route: '/' });
    expect(await onClient()).toBeInTheDocument();
  });

  it('redirects an authed user away from the public-only /signin route', async () => {
    seedAuth(UserRoles.ADMIN);
    vi.mocked(userApi.me).mockResolvedValue(makeMe({ role: UserRoles.ADMIN }));
    renderWithSession(<AppRouter />, { route: '/signin' });
    expect(await onAdmin()).toBeInTheDocument();
  });

  it('renders the 404 panel for an unknown path', async () => {
    renderWithSession(<AppRouter />, { route: '/does-not-exist' });
    expect(await screen.findByText('404 — Not found')).toBeInTheDocument();
  });
});

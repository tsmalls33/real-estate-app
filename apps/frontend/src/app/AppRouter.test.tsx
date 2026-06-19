import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { UserRoles, type MeResponse } from '@RealEstate/types';

vi.mock('../shared/api/services', () => ({
  userApi: { me: vi.fn() },
  propertyApi: { list: vi.fn() },
  tenantApi: { list: vi.fn(), updateTheme: vi.fn(), assignTheme: vi.fn() },
  authApi: { signin: vi.fn(), signup: vi.fn() },
}));

import { userApi, propertyApi } from '../shared/api/services';
import { seedAuth, clearAuth } from '../test-utils/auth';
import { renderWithSession } from '../test-utils/render';
import AppRouter from './AppRouter';

const meClient: MeResponse = {
  id_user: 'c1',
  email: 'client@acme.com',
  firstName: 'Cli',
  lastName: 'Ent',
  role: UserRoles.CLIENT,
  id_tenant: 't1',
  tenant: { id_tenant: 't1', name: 'Acme', customDomain: null, id_plan: null, theme: null },
};

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
});

describe('AppRouter guards', () => {
  it('redirects an unauthed user from a protected route to /signin', async () => {
    renderWithSession(<AppRouter />, { route: '/admin' });
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('redirects a CLIENT away from /admin to the client landing', async () => {
    seedAuth(UserRoles.CLIENT);
    vi.mocked(userApi.me).mockResolvedValue(meClient);
    vi.mocked(propertyApi.list).mockResolvedValue({ properties: [], total: 0 });

    renderWithSession(<AppRouter />, { route: '/admin' });
    // ClientShell greeting confirms we landed on /client.
    expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
  });
});

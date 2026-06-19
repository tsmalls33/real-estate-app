import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { UserRoles, type MeResponse } from '@RealEstate/types';

vi.mock('../../shared/api/services', () => ({
  userApi: { me: vi.fn() },
  propertyApi: { list: vi.fn() },
  tenantApi: { list: vi.fn(), updateTheme: vi.fn(), assignTheme: vi.fn() },
  authApi: { signin: vi.fn(), signup: vi.fn() },
}));

import { userApi } from '../../shared/api/services';
import { seedAuth, clearAuth } from '../../test-utils/auth';
import { renderWithSession } from '../../test-utils/render';
import AdminShell from './AdminShell';

const meAdmin: MeResponse = {
  id_user: 'a1',
  email: 'ann@acme.com',
  firstName: 'Ann',
  lastName: 'Dmin',
  role: UserRoles.ADMIN,
  id_tenant: 't1',
  tenant: { id_tenant: 't1', name: 'Acme', customDomain: null, id_plan: null, theme: null },
};
const meSuper: MeResponse = { ...meAdmin, role: UserRoles.SUPERADMIN, id_tenant: null, tenant: null };

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
});

describe('AdminShell', () => {
  it('hides the Tenants link for ADMIN', async () => {
    seedAuth(UserRoles.ADMIN);
    vi.mocked(userApi.me).mockResolvedValue(meAdmin);

    renderWithSession(<AdminShell />, { route: '/admin' });

    expect(await screen.findByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /tenants/i })).not.toBeInTheDocument();
  });

  it('shows the Tenants link for SUPERADMIN', async () => {
    seedAuth(UserRoles.SUPERADMIN);
    vi.mocked(userApi.me).mockResolvedValue(meSuper);

    renderWithSession(<AdminShell />, { route: '/admin' });

    expect(await screen.findByRole('link', { name: /tenants/i })).toBeInTheDocument();
  });
});

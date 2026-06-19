import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { UserRoles } from '@RealEstate/types';

vi.mock('../../shared/api/services', () => ({
  userApi: { me: vi.fn() },
  propertyApi: { list: vi.fn() },
  tenantApi: { list: vi.fn(), updateTheme: vi.fn(), assignTheme: vi.fn() },
  authApi: { signin: vi.fn(), signup: vi.fn() },
}));

import { userApi, tenantApi } from '../../shared/api/services';
import { seedAuth, clearAuth } from '../../test-utils/auth';
import { makeMe, makeTenant } from '../../test-utils/factories';
import { renderWithSession } from '../../test-utils/render';
import Tenants from './Tenants';

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
  seedAuth(UserRoles.SUPERADMIN);
  vi.mocked(userApi.me).mockResolvedValue(makeMe({ role: UserRoles.SUPERADMIN }));
});

describe('Tenants', () => {
  it('lists the tenants returned by the API', async () => {
    vi.mocked(tenantApi.list).mockResolvedValue([
      makeTenant({ id_tenant: 't1', name: 'Acme', customDomain: 'acme.test', id_plan: 'plan-1' }),
      makeTenant({ id_tenant: 't2', name: 'Globex', customDomain: null, id_plan: null }),
    ]);

    renderWithSession(<Tenants />);

    expect(await screen.findByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.getByText('acme.test')).toBeInTheDocument();
    expect(screen.getByText('no custom domain')).toBeInTheDocument();
    expect(screen.getByText('On plan')).toBeInTheDocument();
    expect(screen.getByText('No plan')).toBeInTheDocument();
  });

  it('shows the empty state when there are no tenants', async () => {
    vi.mocked(tenantApi.list).mockResolvedValue([]);
    renderWithSession(<Tenants />);
    expect(await screen.findByText('No tenants yet.')).toBeInTheDocument();
  });

  it('surfaces a load error', async () => {
    vi.mocked(tenantApi.list).mockRejectedValue(new Error('nope'));
    renderWithSession(<Tenants />);
    expect(await screen.findByText(/couldn't load tenants: nope/i)).toBeInTheDocument();
  });
});

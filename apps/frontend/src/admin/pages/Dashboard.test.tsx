import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { UserRoles } from '@RealEstate/types';

vi.mock('../../shared/api/services', () => ({
  userApi: { me: vi.fn() },
  propertyApi: { list: vi.fn() },
  tenantApi: { list: vi.fn(), updateTheme: vi.fn(), assignTheme: vi.fn() },
  authApi: { signin: vi.fn(), signup: vi.fn() },
}));

import { userApi, propertyApi } from '../../shared/api/services';
import { seedAuth, clearAuth } from '../../test-utils/auth';
import { makeMe, makeProperty } from '../../test-utils/factories';
import { renderWithSession } from '../../test-utils/render';
import Dashboard from './Dashboard';

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
  seedAuth(UserRoles.ADMIN);
  vi.mocked(userApi.me).mockResolvedValue(makeMe({ role: UserRoles.ADMIN }));
});

describe('Admin Dashboard', () => {
  it('renders the title with the API total and owner names on cards', async () => {
    vi.mocked(propertyApi.list).mockResolvedValue({
      properties: [
        makeProperty({
          id_property: 'p1',
          propertyName: 'Sunny Villa',
          owner: { id_user: 'o1', firstName: 'Jane', lastName: 'Smith', email: 'jane@acme.com' },
        }),
      ],
      total: 7,
    });

    renderWithSession(<Dashboard />);

    expect(await screen.findByRole('heading', { name: /properties \(7\)/i })).toBeInTheDocument();
    expect(screen.getByText('Sunny Villa')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows the empty state when the total is 0', async () => {
    vi.mocked(propertyApi.list).mockResolvedValue({ properties: [], total: 0 });

    renderWithSession(<Dashboard />);

    expect(await screen.findByRole('heading', { name: /properties \(0\)/i })).toBeInTheDocument();
    expect(screen.getByText(/no properties yet/i)).toBeInTheDocument();
  });

  it('surfaces a load error', async () => {
    vi.mocked(propertyApi.list).mockRejectedValue(new Error('boom'));

    renderWithSession(<Dashboard />);

    expect(await screen.findByText(/couldn't load properties: boom/i)).toBeInTheDocument();
  });
});

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
  seedAuth(UserRoles.CLIENT);
  vi.mocked(userApi.me).mockResolvedValue(makeMe({ role: UserRoles.CLIENT }));
});

describe('Client Dashboard', () => {
  it('renders the section title without a count and lists properties', async () => {
    vi.mocked(propertyApi.list).mockResolvedValue({
      properties: [makeProperty({ propertyName: 'Lake House' })],
      total: 1,
    });

    renderWithSession(<Dashboard />);

    const heading = await screen.findByRole('heading', { name: 'Your properties' });
    expect(heading).toBeInTheDocument();
    expect(heading).not.toHaveTextContent(/\(/); // no count in parens
    expect(screen.getByText('Lake House')).toBeInTheDocument();
  });

  it('shows the client empty-state copy', async () => {
    vi.mocked(propertyApi.list).mockResolvedValue({ properties: [], total: 0 });

    renderWithSession(<Dashboard />);

    expect(await screen.findByText("You don't have any properties yet.")).toBeInTheDocument();
  });

  it('surfaces a load error', async () => {
    vi.mocked(propertyApi.list).mockRejectedValue(new Error('down'));

    renderWithSession(<Dashboard />);

    expect(await screen.findByRole('heading', { name: 'Network error' })).toBeInTheDocument();
    expect(screen.getByText(/could not reach the server/i)).toBeInTheDocument();
  });
});

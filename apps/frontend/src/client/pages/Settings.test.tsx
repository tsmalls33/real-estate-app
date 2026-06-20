import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { UserRoles } from '@RealEstate/types';

vi.mock('../../shared/api/services', () => ({
  userApi: { me: vi.fn() },
  propertyApi: { list: vi.fn() },
  tenantApi: { list: vi.fn(), updateTheme: vi.fn(), assignTheme: vi.fn() },
  authApi: { signin: vi.fn(), signup: vi.fn() },
}));

import { userApi } from '../../shared/api/services';
import { seedAuth, clearAuth } from '../../test-utils/auth';
import { makeMe } from '../../test-utils/factories';
import { renderWithSession } from '../../test-utils/render';
import Settings from './Settings';

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
  seedAuth(UserRoles.CLIENT);
  vi.mocked(userApi.me).mockResolvedValue(makeMe({ role: UserRoles.CLIENT }));
});

describe('Client Settings', () => {
  it('shows name and email only — no role, no theme editor', async () => {
    renderWithSession(<Settings />);

    expect(await screen.findByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByText('Ada Min')).toBeInTheDocument();
    expect(screen.getByText('user@acme.com')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Tenant theme' })).not.toBeInTheDocument();
    expect(screen.queryByText(/^CLIENT$/)).not.toBeInTheDocument();
  });
});

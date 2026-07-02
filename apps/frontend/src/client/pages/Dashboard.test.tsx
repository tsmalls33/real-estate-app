import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';

vi.mock('../../shared/api/services', () => ({
  userApi: { me: vi.fn() },
  propertyApi: { list: vi.fn() },
  tenantApi: { list: vi.fn(), updateTheme: vi.fn(), assignTheme: vi.fn() },
  authApi: { signin: vi.fn(), signup: vi.fn() },
  ownerApi: { dashboard: vi.fn() },
}));

import { userApi, ownerApi } from '../../shared/api/services';
import { seedAuth, clearAuth } from '../../test-utils/auth';
import { makeMe, makeOwnerDashboard } from '../../test-utils/factories';
import { renderWithSession } from '../../test-utils/render';
import { UserRoles } from '@RealEstate/types';
import Dashboard from './Dashboard';

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
  seedAuth(UserRoles.CLIENT);
  vi.mocked(userApi.me).mockResolvedValue(makeMe({ role: UserRoles.CLIENT }));
});

describe('Client Dashboard', () => {
  it('renders the overview KPIs and chart', async () => {
    vi.mocked(ownerApi.dashboard).mockResolvedValue(makeOwnerDashboard());

    renderWithSession(<Dashboard />);

    expect(await screen.findByText('Income · Last Month')).toBeInTheDocument();
    expect(screen.getByText('Nights Booked')).toBeInTheDocument();
    expect(screen.getByText('Avg. Nightly')).toBeInTheDocument();
    expect(screen.getByText('Next Payout')).toBeInTheDocument();
  });

  it('surfaces a load error', async () => {
    vi.mocked(ownerApi.dashboard).mockRejectedValue(new Error('down'));

    renderWithSession(<Dashboard />);

    expect(await screen.findByRole('heading', { name: 'Network error' })).toBeInTheDocument();
    expect(screen.getByText('down')).toBeInTheDocument();
  });

  it('fetches the combined view when no property is selected', async () => {
    vi.mocked(ownerApi.dashboard).mockResolvedValue(makeOwnerDashboard());

    renderWithSession(<Dashboard />);

    expect(await screen.findByText('Income · Last Month')).toBeInTheDocument();
    expect(ownerApi.dashboard).toHaveBeenCalledWith(undefined);
  });

  it('scopes the fetch to the selected property from the URL', async () => {
    vi.mocked(ownerApi.dashboard).mockResolvedValue(makeOwnerDashboard());

    renderWithSession(<Dashboard />, { route: '/?property=p2' });

    expect(await screen.findByText('Income · Last Month')).toBeInTheDocument();
    expect(ownerApi.dashboard).toHaveBeenCalledWith('p2');
  });
});

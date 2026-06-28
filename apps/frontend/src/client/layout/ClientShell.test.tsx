import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { UserRoles } from '@RealEstate/types';

vi.mock('../../shared/api/services', () => ({
  userApi: { me: vi.fn() },
  propertyApi: { list: vi.fn() },
  tenantApi: { list: vi.fn(), updateTheme: vi.fn(), assignTheme: vi.fn() },
  authApi: { signin: vi.fn(), signup: vi.fn(), logout: vi.fn().mockResolvedValue(undefined) },
}));

import { userApi } from '../../shared/api/services';
import { seedAuth, clearAuth } from '../../test-utils/auth';
import { makeMe } from '../../test-utils/factories';
import { renderWithSession } from '../../test-utils/render';
import ClientShell from './ClientShell';

function renderShell() {
  seedAuth(UserRoles.CLIENT);
  vi.mocked(userApi.me).mockResolvedValue(makeMe({ role: UserRoles.CLIENT, firstName: 'Cleo' }));
  return renderWithSession(
    <Routes>
      <Route path="/client" element={<ClientShell />}>
        <Route index element={<div>overview page</div>} />
        <Route path="settings" element={<div>settings page</div>} />
      </Route>
      <Route path="/signin" element={<div>signin page</div>} />
    </Routes>,
    { route: '/client' },
  );
}

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
});

describe('ClientShell', () => {
  it('greets the user by name and shows their email', async () => {
    renderShell();
    expect(await screen.findByText('Welcome back, Cleo')).toBeInTheDocument();
    expect(screen.getByText('user@acme.com')).toBeInTheDocument();
  });

  it('navigates between tabs', async () => {
    renderShell();
    expect(await screen.findByText('overview page')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: /settings/i }));
    expect(await screen.findByText('settings page')).toBeInTheDocument();
  });

  it('signs out: clears tokens and navigates to /signin', async () => {
    renderShell();
    await userEvent.click(await screen.findByRole('button', { name: /sign out/i }));

    expect(await screen.findByText('signin page')).toBeInTheDocument();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { UserRoles } from '@RealEstate/types';

vi.mock('../../shared/api/services', () => ({
  userApi: { me: vi.fn() },
  propertyApi: { list: vi.fn() },
  tenantApi: { list: vi.fn(), updateTheme: vi.fn(), assignTheme: vi.fn() },
  authApi: { signin: vi.fn(), signup: vi.fn() },
}));

import { userApi } from '../../shared/api/services';
import { seedAuth, clearAuth, fakeToken } from '../../test-utils/auth';
import { makeMe } from '../../test-utils/factories';
import { renderWithSession } from '../../test-utils/render';
import AdminShell from './AdminShell';

function renderShell(role: UserRoles) {
  seedAuth(role);
  vi.mocked(userApi.me).mockResolvedValue(makeMe({ role }));
  return renderWithSession(
    <Routes>
      <Route path="/admin" element={<AdminShell />} />
      <Route path="/signin" element={<div>signin page</div>} />
    </Routes>,
    { route: '/admin' },
  );
}

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
});

describe('AdminShell', () => {
  it('hides the Tenants link for ADMIN but always shows Settings', async () => {
    renderShell(UserRoles.ADMIN);
    expect(await screen.findByRole('link', { name: /settings/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /tenants/i })).not.toBeInTheDocument();
  });

  it('shows the Tenants link for SUPERADMIN', async () => {
    renderShell(UserRoles.SUPERADMIN);
    expect(await screen.findByRole('link', { name: /tenants/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('shows the tenant name from the session', async () => {
    renderShell(UserRoles.ADMIN);
    expect((await screen.findAllByText('Acme')).length).toBeGreaterThan(0);
  });

  it('signs out: clears tokens and navigates to /signin', async () => {
    renderShell(UserRoles.ADMIN);
    await userEvent.click(await screen.findByRole('button', { name: /sign out/i }));

    expect(await screen.findByText('signin page')).toBeInTheDocument();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});

// Sanity: fakeToken encodes a decodable role, so guards see the same role the
// session is told to render.
describe('fakeToken', () => {
  it('round-trips the role in the JWT payload', () => {
    const token = fakeToken({ role: UserRoles.SUPERADMIN });
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    expect(payload.role).toBe(UserRoles.SUPERADMIN);
  });
});

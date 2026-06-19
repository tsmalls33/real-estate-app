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

import { authApi, userApi } from '../../shared/api/services';
import { clearAuth } from '../../test-utils/auth';
import { makeMe } from '../../test-utils/factories';
import { renderWithSession } from '../../test-utils/render';
import Signup from './Signup';

function renderSignup() {
  return renderWithSession(
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin" element={<div>admin landing</div>} />
      <Route path="/client" element={<div>client landing</div>} />
    </Routes>,
    { route: '/signup' },
  );
}

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
  vi.mocked(userApi.me).mockResolvedValue(makeMe({ role: UserRoles.CLIENT }));
});

describe('Signup', () => {
  it('creates the user, auto-signs in, and navigates to the role landing', async () => {
    vi.mocked(authApi.signup).mockResolvedValue({ id_user: 'new-1' } as never);
    vi.mocked(authApi.signin).mockResolvedValue({
      user: { role: UserRoles.CLIENT } as never,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });

    renderSignup();
    await userEvent.type(screen.getByLabelText('Email'), 'new@acme.com');
    await userEvent.type(screen.getByLabelText('Password'), 'hunter2!!');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('client landing')).toBeInTheDocument();
    expect(authApi.signup).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@acme.com', password: 'hunter2!!' }),
    );
    expect(authApi.signin).toHaveBeenCalledWith('new@acme.com', 'hunter2!!');
    expect(localStorage.getItem('accessToken')).toBe('access-1');
    // auto-signin must refresh the session before landing on the portal.
    expect(userApi.me).toHaveBeenCalled();
  });

  it('surfaces the error message on a 409 conflict', async () => {
    vi.mocked(authApi.signup).mockRejectedValue(new Error('Email already registered'));

    renderSignup();
    await userEvent.type(screen.getByLabelText('Email'), 'taken@acme.com');
    await userEvent.type(screen.getByLabelText('Password'), 'hunter2!!');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Email already registered')).toBeInTheDocument();
    expect(authApi.signin).not.toHaveBeenCalled();
  });
});

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
import Login from './Login';

function renderLogin() {
  return renderWithSession(
    <Routes>
      <Route path="/signin" element={<Login />} />
      <Route path="/admin" element={<div>admin landing</div>} />
      <Route path="/client" element={<div>client landing</div>} />
    </Routes>,
    { route: '/signin' },
  );
}

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
  vi.mocked(userApi.me).mockResolvedValue(makeMe());
});

describe('Login', () => {
  it('signs in, persists tokens, and navigates to the role landing', async () => {
    vi.mocked(authApi.signin).mockResolvedValue({
      user: { role: UserRoles.ADMIN } as never,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });

    renderLogin();
    await userEvent.type(screen.getByLabelText('Email'), 'ada@acme.com');
    await userEvent.type(screen.getByLabelText('Password'), 'hunter2!!');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('admin landing')).toBeInTheDocument();
    expect(authApi.signin).toHaveBeenCalledWith('ada@acme.com', 'hunter2!!');
    expect(localStorage.getItem('accessToken')).toBe('access-1');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-1');
    // refresh() must run so the session reflects the new user before we land.
    // (it only calls userApi.me when a token is present — which only the login set)
    expect(userApi.me).toHaveBeenCalled();
  });

  it('surfaces the error message on a 401', async () => {
    vi.mocked(authApi.signin).mockRejectedValue(new Error('Invalid credentials'));

    renderLogin();
    await userEvent.type(screen.getByLabelText('Email'), 'ada@acme.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});

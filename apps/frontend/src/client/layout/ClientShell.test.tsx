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

const backdrop = () => screen.queryByTestId('drawer-backdrop');

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
});

describe('ClientShell', () => {
  it('greets the user by name and shows their email', async () => {
    renderShell();
    expect(await screen.findByText('Welcome back, Cleo')).toBeInTheDocument();
    // Email shows in both the greeting and the drawer's account footer.
    expect(screen.getAllByText('user@acme.com').length).toBeGreaterThan(0);
  });

  it('navigates between tabs', async () => {
    renderShell();
    expect(await screen.findByText('overview page')).toBeInTheDocument();

    // Settings appears in both the desktop tab row and the mobile drawer; either navigates.
    const settingsLink = screen.getAllByRole('link', { name: /settings/i }).find(l => l.getAttribute('href')?.endsWith('/client/settings'));
    await userEvent.click(settingsLink!);
    expect(await screen.findByText('settings page')).toBeInTheDocument();
  });

  it('signs out: clears tokens and navigates to /signin', async () => {
    renderShell();
    const [signOutBtn] = await screen.findAllByRole('button', { name: /sign out/i });
    await userEvent.click(signOutBtn);

    expect(await screen.findByText('signin page')).toBeInTheDocument();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('opens the drawer when the hamburger is tapped', async () => {
    renderShell();
    await screen.findByText('overview page');

    expect(backdrop()).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(backdrop()).not.toBeNull();
  });

  it('dismisses the drawer on backdrop click', async () => {
    renderShell();
    await screen.findByRole('button', { name: /open menu/i });

    await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
    const overlay = backdrop();
    expect(overlay).not.toBeNull();

    await userEvent.click(overlay as Element);
    expect(backdrop()).toBeNull();
  });

  it('dismisses the drawer on route change', async () => {
    renderShell();
    await screen.findByRole('button', { name: /open menu/i });

    await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(backdrop()).not.toBeNull();

    const settingsLink = screen.getAllByRole('link', { name: /settings/i }).find(l => l.getAttribute('href')?.endsWith('/client/settings'));
    await userEvent.click(settingsLink!);
    expect(await screen.findByText('settings page')).toBeInTheDocument();
    expect(backdrop()).toBeNull();
  });

  describe('accessibility', () => {
    it('exposes banner, navigation, and main landmarks', async () => {
      renderShell();
      expect(await screen.findByRole('banner')).toBeInTheDocument();
      expect(screen.getAllByRole('navigation').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('marks the active nav link with aria-current="page"', async () => {
      renderShell();
      const overviewLinks = await screen.findAllByRole('link', { name: /overview/i });
      const activeOverview = overviewLinks.find(l => l.getAttribute('aria-current') === 'page');
      expect(activeOverview).toBeTruthy();
      const settingsLinks = screen.getAllByRole('link', { name: /settings/i });
      settingsLinks.forEach(l => expect(l.getAttribute('aria-current')).toBeNull());
    });

    it('hides decorative nav icons from the accessibility tree', async () => {
      const { container } = renderShell();
      await screen.findByText('overview page');
      expect(container.querySelectorAll('svg[aria-hidden="true"]').length).toBeGreaterThanOrEqual(2);
    });
  });
});

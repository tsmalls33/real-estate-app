import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserRoles } from '@RealEstate/types';

vi.mock('../../shared/api/services', () => ({
  userApi: { me: vi.fn() },
  propertyApi: { list: vi.fn() },
  tenantApi: { list: vi.fn(), updateTheme: vi.fn(), assignTheme: vi.fn() },
  authApi: { signin: vi.fn(), signup: vi.fn() },
}));

import { userApi, tenantApi } from '../../shared/api/services';
import { seedAuth, clearAuth } from '../../test-utils/auth';
import { makeMe } from '../../test-utils/factories';
import { renderWithSession } from '../../test-utils/render';
import Settings from './Settings';

function setSession(role: UserRoles) {
  seedAuth(role);
  vi.mocked(userApi.me).mockResolvedValue(makeMe({ role }));
}

beforeEach(() => {
  clearAuth();
  vi.clearAllMocks();
});

describe('Admin Settings', () => {
  it('shows profile details (name, email, tenant) and no role', async () => {
    setSession(UserRoles.ADMIN);
    renderWithSession(<Settings />);

    expect(await screen.findByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByText('Ada Min')).toBeInTheDocument();
    expect(screen.getByText('user@acme.com')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.queryByText(/^ADMIN$/)).not.toBeInTheDocument();
  });

  it('shows the theme editor for ADMIN', async () => {
    setSession(UserRoles.ADMIN);
    renderWithSession(<Settings />);
    expect(await screen.findByRole('heading', { name: 'Tenant theme' })).toBeInTheDocument();
  });

  it('hides the theme editor for EMPLOYEE', async () => {
    setSession(UserRoles.EMPLOYEE);
    renderWithSession(<Settings />);
    await screen.findByRole('heading', { name: 'Profile' });
    expect(screen.queryByRole('heading', { name: 'Tenant theme' })).not.toBeInTheDocument();
  });

  it('keeps the hex text input in sync with the color picker', async () => {
    setSession(UserRoles.ADMIN);
    renderWithSession(<Settings />);

    const picker = await screen.findByLabelText('Brand primary');
    fireEvent.change(picker, { target: { value: '#abcdef' } });

    // textboxes are the 3 hex inputs: [background, brand, secondary]
    const hexInputs = screen.getAllByRole('textbox');
    expect(hexInputs[1]).toHaveValue('#ABCDEF');
  });

  it('disables Save when a hex value is invalid', async () => {
    setSession(UserRoles.ADMIN);
    renderWithSession(<Settings />);
    await screen.findByRole('heading', { name: 'Tenant theme' });

    const saveBtn = screen.getByRole('button', { name: /save theme/i });
    expect(saveBtn).toBeEnabled();

    const brandHex = screen.getAllByRole('textbox')[1];
    await userEvent.clear(brandHex);
    await userEvent.type(brandHex, 'zzz');

    expect(saveBtn).toBeDisabled();
  });

  it('saves the theme: calls updateTheme then refreshes', async () => {
    setSession(UserRoles.ADMIN);
    vi.mocked(tenantApi.updateTheme).mockResolvedValue({} as never);
    renderWithSession(<Settings />);
    await screen.findByRole('heading', { name: 'Tenant theme' });

    await userEvent.click(screen.getByRole('button', { name: /save theme/i }));

    expect(tenantApi.updateTheme).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({
        backgroundColor: expect.any(String),
        brandColor: expect.any(String),
        secondaryColor: expect.any(String),
      }),
    );
    const card = (await screen.findByRole('heading', { name: 'Tenant theme' })).closest('section')!;
    expect(within(card).getByText('Theme updated.')).toBeInTheDocument();
    // refresh() re-fetches the session
    expect(userApi.me).toHaveBeenCalledTimes(2);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserRoles } from '@RealEstate/types';
import { ProtectedRoute } from './ProtectedRoute';
import { seedAuth, clearAuth } from '../../test-utils/auth';

// Renders the guard at /p with sink routes so a redirect is observable by
// which page text appears.
function renderGuard(allow?: UserRoles[]) {
  return render(
    <MemoryRouter initialEntries={['/p']}>
      <Routes>
        <Route
          path="/p"
          element={
            <ProtectedRoute allow={allow}>
              <div>protected content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/signin" element={<div>signin page</div>} />
        <Route path="/admin" element={<div>admin landing</div>} />
        <Route path="/client" element={<div>client landing</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => clearAuth());

describe('ProtectedRoute', () => {
  it('redirects to /signin when there is no token', () => {
    renderGuard([UserRoles.ADMIN]);
    expect(screen.getByText('signin page')).toBeInTheDocument();
    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
  });

  it('redirects to the role landing when the role is not allowed', () => {
    seedAuth(UserRoles.CLIENT);
    renderGuard([UserRoles.ADMIN]);
    expect(screen.getByText('client landing')).toBeInTheDocument();
    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
  });

  it('renders children when the role is allowed', () => {
    seedAuth(UserRoles.ADMIN);
    renderGuard([UserRoles.ADMIN]);
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });

  it('passes through an authed user when no allow list is given', () => {
    seedAuth(UserRoles.EMPLOYEE);
    renderGuard();
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});

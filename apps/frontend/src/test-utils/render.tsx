import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../shared/theme/ThemeContext';

// Wraps UI in the real SessionProvider + a MemoryRouter. The session `me` is
// injected by mocking `userApi.me` in the test file (SessionProvider fetches it
// on mount), while route guards read the JWT seeded via test-utils/auth. Both
// the JWT role and the mocked `me.role` must agree — derive them from one role.
export function renderWithSession(ui: ReactNode, { route = '/' }: { route?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <SessionProvider>{ui}</SessionProvider>
    </MemoryRouter>,
  );
}

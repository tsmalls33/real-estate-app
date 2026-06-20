import { UserRoles } from '@RealEstate/types';

// Route guards (ProtectedRoute, AppRouter, HomeRedirect/PublicOnly) read the
// role from a real JWT in localStorage via decodeToken(), so guard tests must
// seed a real token — they cannot mock the tokens module, which is the code
// under test. Build a token whose payload segment is valid base64url JSON.
function base64url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fakeToken(payload: {
  role: UserRoles;
  sub?: string;
  email?: string;
  tenantId?: string | null;
}): string {
  const body = base64url(
    JSON.stringify({ sub: 'u1', email: 'u@example.com', tenantId: null, ...payload }),
  );
  return `header.${body}.signature`;
}

export function seedAuth(role: UserRoles): void {
  localStorage.setItem('accessToken', fakeToken({ role }));
  localStorage.setItem('refreshToken', 'refresh-token');
}

export function clearAuth(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

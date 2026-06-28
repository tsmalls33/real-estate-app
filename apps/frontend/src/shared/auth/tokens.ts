import { UserRoles } from '@RealEstate/types';

type Payload = { sub: string; email: string; role: UserRoles; tenantId: string | null };

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// JWT segments are base64url (-/_ , no padding); atob expects base64.
function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return atob(padded);
}

export function decodeToken(): Payload | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    return JSON.parse(decodeBase64Url(token.split('.')[1])) as Payload;
  } catch {
    return null;
  }
}

export function getRole(): UserRoles | null {
  return decodeToken()?.role ?? null;
}

export function landingForRole(role: UserRoles): string {
  if (role === UserRoles.CLIENT) return '/client';
  return '/admin';
}

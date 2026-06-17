import { UserRoles } from '@RealEstate/types';

type Payload = { sub: string; email: string; role: UserRoles; tenantId: string | null };

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function decodeToken(): Payload | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1])) as Payload;
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

import { UserRoles } from '@RealEstate/types';

export function getTokenPayload() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function isClient() {
  return getTokenPayload()?.role === UserRoles.CLIENT;
}

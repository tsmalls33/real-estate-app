import { api, type Envelope } from './client';
import type {
  MeResponse,
  Property,
  Tenant,
  ThemeMode,
  User,
  UserRoles,
} from '@RealEstate/types';

// Session payload returned by both /auth/signin and /auth/signup. Shared so the
// two endpoints can't drift out of sync.
type AuthSession = { user: User; accessToken: string; refreshToken: string };

export const authApi = {
  signin: (email: string, password: string) =>
    api.post<Envelope<AuthSession>>(
      '/auth/signin',
      { email, password },
    ).then(r => r.data),

  signup: (input: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api.post<Envelope<AuthSession>>(
      '/auth/signup',
      input,
    ).then(r => r.data),
};

export const userApi = {
  me: () => api.get<Envelope<MeResponse>>('/user/me').then(r => r.data),

  // Persist the current user's theme-mode preference.
  updateThemeMode: (preferredThemeMode: ThemeMode) =>
    api.patch<Envelope<MeResponse>>('/user/me', { preferredThemeMode }).then(r => r.data),
};

export const propertyApi = {
  list: () =>
    api.get<Envelope<{ properties: Property[]; total: number }>>('/properties').then(r => r.data),
};

export const tenantApi = {
  list: () => api.get<Envelope<Tenant[]>>('/tenant').then(r => r.data),

  // Edit the tenant's own theme fields.
  updateTheme: (
    id_tenant: string,
    input: {
      name?: string;
      backgroundColor?: string;
      brandColor?: string;
      secondaryColor?: string;
      logoIcon?: string | null;
      logoBanner?: string | null;
    },
  ) => api.patch<Envelope<Tenant>>(`/tenant/${id_tenant}/theme`, input).then(r => r.data),

  // Reassign the tenant to a different, existing theme.
  assignTheme: (id_tenant: string, id_theme: string) =>
    api.put<Envelope<Tenant>>(`/tenant/${id_tenant}/theme`, { id_theme }).then(r => r.data),
};

export type { MeResponse, Property, Tenant, UserRoles };

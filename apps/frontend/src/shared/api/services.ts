import { api, type Envelope } from './client';
import type {
  MeResponse,
  Property,
  Tenant,
  User,
  UserRoles,
} from '@RealEstate/types';

export const authApi = {
  signin: (email: string, password: string) =>
    api.post<Envelope<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/signin',
      { email, password },
    ).then(r => r.data),

  signup: (input: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api.post<Envelope<User>>('/auth/signup', input).then(r => r.data),
};

export const userApi = {
  me: () => api.get<Envelope<MeResponse>>('/user/me').then(r => r.data),
};

export const propertyApi = {
  list: () =>
    api.get<Envelope<{ properties: Property[]; total: number }>>('/properties').then(r => r.data),
};

export const tenantApi = {
  list: () => api.get<Envelope<Tenant[]>>('/tenant').then(r => r.data),

  updateTheme: (
    id_tenant: string,
    input: {
      id_theme?: string;
      name?: string;
      backgroundColor?: string;
      brandColor?: string;
      secondaryColor?: string;
    },
  ) => api.patch<Envelope<Tenant>>(`/tenant/${id_tenant}/theme`, input).then(r => r.data),
};

export type { MeResponse, Property, Tenant, UserRoles };

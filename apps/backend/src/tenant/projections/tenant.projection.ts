import { USER_PUBLIC_SELECT } from '../../user/projections/user.projection';

export const TENANT_PUBLIC_SELECT = {
  id_tenant: true,
  name: true,
  customDomain: true,
  id_theme: true,
} as const;

export const TENANT_WITH_USERS_SELECT = {
  ...TENANT_PUBLIC_SELECT,
  users: {
    select: USER_PUBLIC_SELECT,
  },
} as const;

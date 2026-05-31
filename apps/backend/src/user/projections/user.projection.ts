export const USER_PUBLIC_SELECT = {
  id_user: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  id_tenant: true,
} as const;

export const USER_AUTH_SELECT = {
  ...USER_PUBLIC_SELECT,
  passwordHash: true,
} as const;

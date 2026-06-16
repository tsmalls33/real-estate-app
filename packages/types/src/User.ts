
export const UserRoles = {
  CLIENT: 'CLIENT',
  ADMIN: 'ADMIN',
  SUPERADMIN: 'SUPERADMIN',
  EMPLOYEE: 'EMPLOYEE'
} as const;

export type UserRoles = (typeof UserRoles)[keyof typeof UserRoles]

export class User {
  id_user!: string;
  email!: string;
  firstName?: string | null;
  lastName?: string | null;
  role!: UserRoles;
  id_tenant?: string | null;
}


export class PrivateUser extends User {
  passwordHash?: string
}

export class CreateUserDto {
  email!: string;
  password!: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: UserRoles | null;
  id_tenant?: string | null; // Optional, if user is created within a tenant context
}


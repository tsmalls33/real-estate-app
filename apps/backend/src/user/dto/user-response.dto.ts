import { UserRoles } from '@RealEstate/types';

export class UserResponseDto {
  id_user!: string;
  email!: string;
  firstName?: string | null;
  lastName?: string | null;
  role!: UserRoles;
  id_tenant?: string | null;
}

export class PrivateUserResponseDto extends UserResponseDto {
  passwordHash?: string;
}

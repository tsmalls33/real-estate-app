import { Tenant as SharedTenant, User } from '@RealEstate/types';

export class TenantResponseDto implements SharedTenant {
  id_tenant!: string;
  name!: string;
  customDomain?: string | null;
  id_plan?: string | null;
  users?: User[] | null;
}

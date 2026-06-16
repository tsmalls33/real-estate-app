import { User } from './User'

export class Tenant {
  id_tenant!: string
  name!: string
  customDomain?: string | null
  id_plan?: string | null
  users?: User[] | null
}

export class CreateTenantDto {
  name!: string
  customDomain?: string | null
  id_plan?: string | null
}

export class GetTenantQueryParams {
  includeUsers?: boolean
}

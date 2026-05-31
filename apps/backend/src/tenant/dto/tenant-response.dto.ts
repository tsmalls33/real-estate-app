import { TenantResonseDto as SharedTenantResponseDto, UserResponseDto } from "@RealEstate/types";

export class TenantResponseDto implements SharedTenantResponseDto {
  id_tenant!: string
  name!: string
  customDomain?: string | null
  id_plan?: string | null
  users?: UserResponseDto[] | null
}

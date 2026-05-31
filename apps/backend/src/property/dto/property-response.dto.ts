import { PropertyStatus, SaleType } from '@prisma/client';

export class PropertyResponseDto {
  id_property!: string;
  propertyName!: string;
  propertyAddress!: string;
  propertyDescription?: string | null;
  coverImage?: string | null;
  agentFeePercentage?: any | null;
  salePrice?: any | null;
  saleType?: SaleType | null;
  id_owner?: string | null;
  id_agent?: string | null;
  id_tenant?: string | null;
  status!: PropertyStatus;
  createdAt!: Date;
  updatedAt!: Date;
  // Detail-only fields
  propertyStats?: Record<string, any> | null;
  photos?: Record<string, any>[];
  feeRules?: Record<string, any>[];
}

import { PropertyStatus, RentalMode, SaleType } from '@prisma/client';

export class PropertyResponseDto {
  id_property!: string;
  propertyName!: string;
  propertyAddress!: string;
  propertyDescription?: string | null;
  coverImage?: string | null;
  agentFeePercentage?: any;
  salePrice?: any;
  saleType?: SaleType | null;
  rentalMode?: RentalMode | null;
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

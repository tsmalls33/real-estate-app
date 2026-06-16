export const PropertyStatus = {
  AVAILABLE_SALE: 'AVAILABLE_SALE',
  AVAILABLE_RENTAL: 'AVAILABLE_RENTAL',
  INACTIVE: 'INACTIVE',
  SOLD: 'SOLD',
  UNDER_RENTAL: 'UNDER_RENTAL',
} as const;

export type PropertyStatus = (typeof PropertyStatus)[keyof typeof PropertyStatus];

export const SaleType = {
  RENT: 'RENT',
  SALE: 'SALE',
} as const;

export type SaleType = (typeof SaleType)[keyof typeof SaleType];

export class Property {
  id_property!: string;
  propertyName!: string;
  propertyAddress!: string;
  propertyDescription?: string | null;
  coverImage?: string | null;
  agentFeePercentage?: number | null;
  salePrice?: number | null;
  saleType?: SaleType | null;
  id_owner?: string | null;
  id_agent?: string | null;
  id_tenant?: string | null;
  status!: PropertyStatus;
  createdAt!: Date;
  updatedAt!: Date;
}

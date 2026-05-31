export const PROPERTY_STATS_SELECT = {
  id_property_stats: true,
  id_property: true,
  numberOfBedrooms: true,
  numberOfBathrooms: true,
  sizeSquareMeters: true,
  propertyType: true,
  neighborhood: true,
  yearBuilt: true,
  floorNumber: true,
  hasElevator: true,
  hasGarage: true,
} as const;

export const PHOTO_SELECT = {
  id_photo: true,
  filename: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const FEE_RULE_SELECT = {
  id_fee_rule: true,
  name: true,
  isActive: true,
} as const;

export const PROPERTY_LIST_SELECT = {
  id_property: true,
  propertyName: true,
  propertyAddress: true,
  coverImage: true,
  salePrice: true,
  saleType: true,
  status: true,
  id_owner: true,
  id_agent: true,
  id_tenant: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const PROPERTY_DETAIL_SELECT = {
  ...PROPERTY_LIST_SELECT,
  propertyDescription: true,
  agentFeePercentage: true,
  propertyStats: {
    select: PROPERTY_STATS_SELECT,
  },
  photos: {
    select: PHOTO_SELECT,
  },
  feeRules: {
    select: FEE_RULE_SELECT,
  },
} as const;

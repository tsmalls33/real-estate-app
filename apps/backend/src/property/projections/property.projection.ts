import { Prisma } from '@prisma/client';
import type { PropertyOwnerSummary } from '@RealEstate/types';

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
  rentalMode: true,
  status: true,
  id_owner: true,
  owner: {
    // isDeleted is selected so the repository can hide soft-deleted owners;
    // it is stripped from the response shape (see PropertyListItem below).
    select: {
      id_user: true,
      firstName: true,
      lastName: true,
      email: true,
      isDeleted: true,
    },
  },
  id_agent: true,
  id_tenant: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PropertySelect;

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
} satisfies Prisma.PropertySelect;

type RawPropertyListItem = Prisma.PropertyGetPayload<{
  select: typeof PROPERTY_LIST_SELECT;
}>;
type RawPropertyDetail = Prisma.PropertyGetPayload<{
  select: typeof PROPERTY_DETAIL_SELECT;
}>;

// Public shapes: the raw owner (with isDeleted) is replaced by the trimmed
// PropertyOwnerSummary, or null when the owner is absent or soft-deleted.
export type PropertyListItem = Omit<RawPropertyListItem, 'owner'> & {
  owner: PropertyOwnerSummary | null;
};
export type PropertyDetail = Omit<RawPropertyDetail, 'owner'> & {
  owner: PropertyOwnerSummary | null;
};

type RawOwner = NonNullable<RawPropertyListItem['owner']>;

/**
 * Strip the internal isDeleted flag and null out soft-deleted owners so API
 * consumers never see a deleted user's details. Prisma can't filter a to-one
 * relation in `select`, so this is done post-query.
 */
export function presentOwner<T extends { owner: RawOwner | null }>(
  property: T,
): Omit<T, 'owner'> & { owner: PropertyOwnerSummary | null } {
  const { owner, ...rest } = property;
  if (!owner || owner.isDeleted) {
    return { ...rest, owner: null };
  }
  const { isDeleted, ...summary } = owner;
  void isDeleted;
  return { ...rest, owner: summary };
}

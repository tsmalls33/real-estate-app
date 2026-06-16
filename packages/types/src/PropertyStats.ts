export const PropertyType = {
  APARTMENT: 'APARTMENT',
  HOUSE: 'HOUSE',
  VILLA: 'VILLA'
} as const;

export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export class CreatePropertyStatsDto {
  numberOfBedrooms!: number;
  numberOfBathrooms!: number;
  propertyType!: PropertyType;
  neighborhood?: string;
  sizeSquareMeters?: number;
  yearBuilt?: number;
  floorNumber?: string;
  hasElevator?: boolean;
  hasGarage?: boolean;
}

export class PropertyStats {
  id_property_stats!: string;
  id_property!: string;
  numberOfBedrooms!: number;
  numberOfBathrooms!: number;
  propertyType!: PropertyType;
  neighborhood?: string;
  sizeSquareMeters?: number;
  yearBuilt?: number;
  floorNumber?: string;
  hasElevator?: boolean;
  hasGarage?: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

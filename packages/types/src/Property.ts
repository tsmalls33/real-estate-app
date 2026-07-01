import type { Platform } from './Reservation';

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

export const RentalMode = {
  SHORT_TERM: 'SHORT_TERM',
  LONG_TERM: 'LONG_TERM',
  HYBRID: 'HYBRID',
} as const;

export type RentalMode = (typeof RentalMode)[keyof typeof RentalMode];

export interface PropertyOwnerSummary {
  id_user: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}

export class Property {
  id_property!: string;
  propertyName!: string;
  propertyAddress!: string;
  propertyDescription?: string | null;
  coverImage?: string | null;
  agentFeePercentage?: number | null;
  salePrice?: number | null;
  saleType?: SaleType | null;
  rentalMode?: RentalMode | null;
  id_owner?: string | null;
  owner?: PropertyOwnerSummary | null;
  id_agent?: string | null;
  id_tenant?: string | null;
  status!: PropertyStatus;
  createdAt!: Date;
  updatedAt!: Date;
}

export interface OwnerKpis {
  incomeLastMonth: { amount: number; deltaPercent: number };
  nightsBooked: { booked: number; total: number; occupancyPct: number };
  avgNightly: { amount: number; deltaPercent: number };
  nextPayout: { amount: number; date: string };
}

export interface IncomeChartItem {
  month: string;
  airbnb: number;
  booking: number;
  other: number;
}

export interface UpcomingCheckin {
  id: string;
  guestName: string;
  propertyName: string;
  checkIn: string;
  nights: number;
  channel: Platform;
}

export interface OwnerDashboardResponse {
  kpis: OwnerKpis;
  incomeChart: IncomeChartItem[];
  upcomingCheckins: UpcomingCheckin[];
}

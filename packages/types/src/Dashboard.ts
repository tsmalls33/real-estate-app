import type { Platform } from './Reservation';

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

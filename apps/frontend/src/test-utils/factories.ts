import {
  Language,
  PropertyStatus,
  ThemeMode,
  UserRoles,
  type MeResponse,
  type OwnerDashboardResponse,
  type Property,
  type Tenant,
} from '@RealEstate/types';

// Minimal `tenant` theme used by factories that opt into a theme.
const SAMPLE_THEME = {
  id_theme: 'theme-1',
  name: 'Acme Theme',
  backgroundColor: '#FFFFFF',
  brandColor: '#5A303A',
  secondaryColor: '#EB4F1C',
  logoIcon: null,
  logoBanner: null,
};

type MeTenant = NonNullable<MeResponse['tenant']>;

export function makeTenantSummary(overrides: Partial<MeTenant> = {}): MeTenant {
  return {
    id_tenant: 't1',
    name: 'Acme',
    customDomain: null,
    id_plan: null,
    theme: null,
    ...overrides,
  };
}

export function makeMe(overrides: Partial<MeResponse> = {}): MeResponse {
  return {
    id_user: 'u1',
    email: 'user@acme.com',
    firstName: 'Ada',
    lastName: 'Min',
    role: UserRoles.ADMIN,
    id_tenant: 't1',
    preferredThemeMode: ThemeMode.SYSTEM,
    preferredLanguage: Language.EN,
    tenant: makeTenantSummary(),
    ...overrides,
  };
}

export function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    id_property: 'p1',
    propertyName: 'Sunny Villa',
    propertyAddress: '1 Ocean Rd',
    status: PropertyStatus.AVAILABLE_SALE,
    salePrice: 500000,
    owner: { id_user: 'o1', firstName: 'Jane', lastName: 'Smith', email: 'jane@acme.com' },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function makeTenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id_tenant: 't1',
    name: 'Acme',
    customDomain: null,
    id_plan: null,
    ...overrides,
  };
}

export function makeOwnerDashboard(
  overrides: Partial<OwnerDashboardResponse> = {},
): OwnerDashboardResponse {
  return {
    kpis: {
      incomeLastMonth: { amount: 5460, deltaPercent: 22 },
      nightsBooked: { booked: 54, total: 60, occupancyPct: 90 },
      avgNightly: { amount: 101, deltaPercent: 6 },
      nextPayout: { amount: 2890, date: '2026-07-05' },
    },
    incomeChart: [
      { month: '2026-01', airbnb: 4200, booking: 2100, other: 800 },
      { month: '2026-02', airbnb: 3800, booking: 2400, other: 600 },
      { month: '2026-03', airbnb: 5100, booking: 1900, other: 900 },
      { month: '2026-04', airbnb: 4600, booking: 2300, other: 700 },
      { month: '2026-05', airbnb: 5300, booking: 2600, other: 1100 },
      { month: '2026-06', airbnb: 4900, booking: 2200, other: 850 },
    ],
    upcomingCheckins: [
      {
        id: 'r1',
        guestName: 'A. Schmidt',
        propertyName: 'Apt. Jardines',
        checkIn: '2026-06-17',
        nights: 4,
        channel: 'AIRBNB' as const,
      },
      {
        id: 'r2',
        guestName: 'M. Rossi',
        propertyName: 'Apt. Jardines',
        checkIn: '2026-06-18',
        nights: 7,
        channel: 'BOOKING' as const,
      },
    ],
    ...overrides,
  };
}

export { SAMPLE_THEME };

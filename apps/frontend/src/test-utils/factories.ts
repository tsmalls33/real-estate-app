import {
  PropertyStatus,
  UserRoles,
  type MeResponse,
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

export { SAMPLE_THEME };

import type { TenantScope } from '../types/tenant-scope';
import type { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

export const TENANT_A = 'tenant-aaa-aaa';
export const TENANT_B = 'tenant-bbb-bbb';

export function mockTenantScope(tenantId: string): TenantScope {
  return { type: 'TENANT', tenantId };
}

export function mockSuperadminScope(): TenantScope {
  return { type: 'ALL' };
}

export function mockJwtPayload(overrides?: Partial<JwtPayload>): JwtPayload {
  return {
    sub: 'user-1',
    email: 'employee@test.com',
    role: 'EMPLOYEE',
    tenantId: TENANT_A,
    ...overrides,
  } as JwtPayload;
}

export function mockSuperadminPayload(overrides?: Partial<JwtPayload>): JwtPayload {
  return {
    sub: 'superadmin-1',
    email: 'admin@test.com',
    role: 'SUPERADMIN',
    tenantId: null,
    ...overrides,
  } as JwtPayload;
}

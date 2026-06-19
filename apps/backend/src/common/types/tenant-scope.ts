import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRoles } from '@RealEstate/types';
import type { JwtPayload } from './jwt-payload.interface';

export type TenantScope =
  | { type: 'ALL' }
  | { type: 'TENANT'; tenantId: string };

/**
 * Derive the tenant scope for an authenticated user.
 * SUPERADMIN sees everything; any other role must carry a tenantId, otherwise
 * the account is misconfigured and we refuse rather than run an unscoped query.
 */
export function tenantScopeForUser(user: JwtPayload): TenantScope {
  if (user.role === UserRoles.SUPERADMIN) return { type: 'ALL' };
  if (!user.tenantId) {
    throw new ForbiddenException('Tenant context is required');
  }
  return { type: 'TENANT', tenantId: user.tenantId };
}

/**
 * Throws NotFoundException if the record's tenant does not match the scope.
 * Superadmin (scope.type === 'ALL') always passes.
 */
export function assertTenantMatch(
  scope: TenantScope,
  recordTenantId: string | null,
): void {
  if (scope.type === 'ALL') return;
  if (recordTenantId !== scope.tenantId) {
    throw new NotFoundException('Record not found in your organization');
  }
}

/**
 * Resolve the effective tenant ID for create operations.
 * TENANT scope: always returns scope.tenantId (ignores dto value).
 * ALL scope: returns dtoTenantId if provided, else null.
 */
export function resolveTenantId(
  scope: TenantScope,
  dtoTenantId?: string | null,
): string | null {
  if (scope.type === 'TENANT') return scope.tenantId;
  return dtoTenantId ?? null;
}

/**
 * Returns a Prisma-compatible where-clause fragment that scopes a query to a
 * single tenant. Superadmin (scope.type === 'ALL') returns an empty object so
 * the spread is a no-op.
 *
 * @param scope  The current user's tenant scope.
 * @param path   Optional relation path for models that reach the tenant
 *               through a relation (e.g. Cost -> Property).
 *
 * @example Direct:  where: { ...tenantFilter(scope) }
 * @example Nested:  where: { ...tenantFilter(scope, 'property') }
 */
export function tenantFilter(
  scope: TenantScope,
  path?: string,
): Record<string, unknown> {
  if (scope.type === 'ALL') return {};

  const leaf = { id_tenant: scope.tenantId };
  return path ? { [path]: leaf } : leaf;
}

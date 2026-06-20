---
applyTo: "apps/backend/**/*.ts"
---

# Backend review rules (NestJS)

Prioritize multi-tenant safety and authorization. Be concise; one comment per
real issue; don't restate the diff. Skip formatting/Prettier nits.

## Multi-tenant safety (highest priority)
A leak across tenants is a critical bug. Helpers: `src/common/types/tenant-scope.ts`.
- Every Prisma query on a tenant-owned model MUST be scoped: spread
  `...tenantFilter(scope)` into `where` (or `tenantFilter(scope, 'relation')`
  when the model reaches the tenant through a relation). Flag any
  `findMany/findFirst/findUnique/update/updateMany/delete/deleteMany/count`
  in a repository that lacks it.
- Fetch-by-id then return/mutate MUST call
  `assertTenantMatch(scope, record.id_tenant)`.
- Creates MUST derive the tenant via `resolveTenantId(scope, dto.id_tenant)` —
  never trust a tenantId from the request body for a non-SUPERADMIN.
- `scope` must come from the `@CurrentTenant()` decorator, not rebuilt ad hoc.

## Authorization
- New/changed controller routes must carry `@Roles(...)` unless intentionally
  public. Flag routes with no role decoration.
- Import `UserRoles` from `@RealEstate/types`, never from `@prisma/client`.

## Soft delete
- Models use an `isDeleted` flag. Read queries must include `isDeleted: false`.
- "Deletes" should set `isDeleted: true`, not hard-delete.

## Tests
- Specs mock `PrismaService` (no live DB) — follow that pattern; don't add specs
  that need a real Postgres connection.
- New services/repositories should ship `.spec.ts` coverage.

## Do NOT comment on
- pnpm→npm/yarn suggestions (pnpm only).
- Lint cleanups as blocking.

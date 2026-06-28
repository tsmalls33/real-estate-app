# API Integration Tests

These are HTTP-level integration tests that boot the full NestJS `AppModule` with a real Postgres database (`real-estate-test-db`). They verify individual request/response contracts — not unit behaviour and not full-blown e2e.

## Scope

Each test file covers one domain:

| File | What it tests |
|------|---------------|
| `auth.api-spec.ts` | Signup, signin, protected-route guards, refresh/revoke |
| `users.api-spec.ts` | User CRUD, role-based access control, tenant isolation |
| `properties.api-spec.ts` | Property CRUD, list/filter, tenant scoping |
| `tenants.api-spec.ts` | Tenant + Plan CRUD, SUPERADMIN-only gates, isolation |
| `reservations-costs.api-spec.ts` | Reservation + Cost CRUD, date validation, overlap detection |
| `auth-logout.api-spec.ts` | Refresh-token revocation (issue #42 acceptance) |
| `app.api-spec.ts` | Boilerplate smoke test |

## Running

```bash
# Ensure the test database is running:
pnpm --filter @RealEstate/backend run start:dev:db

# Run ALL integration tests serially:
pnpm --filter @RealEstate/backend exec jest --config ./tests/jest-api.json --runInBand

# Single file:
pnpm --filter @RealEstate/backend exec jest --config ./tests/jest-api.json --runInBand --testPathPatterns="auth"
```

## Conventions

### Serial execution

All test files share the same database (`real-estate-test-db`). `resetDb()` truncates every table in `beforeEach`. Tests **must** run serially (`--runInBand` or `maxWorkers: 1`) to avoid deadlocks on concurrent `TRUNCATE ... CASCADE`.

The `jest-api.json` config sets `maxWorkers: 1` — do not remove it.

### Response interceptor is inactive

The integration harness (`Test.createTestingModule`) does **not** register the global `ResponseInterceptor`. Responses are raw DTOs, not wrapped in `{ code, message, data }`.

### Validation pipe is inactive

The global `ValidationPipe` from `main.ts` is **not** active in tests. This means:

- `@Type(() => Date)` decorators on DTOs do **not** convert string → Date.
- When sending date fields (reservations, costs), use full ISO-8601 datetime strings (`2026-06-01T00:00:00.000Z`) so Prisma can parse them directly. Date-only strings (`2026-06-01`) will be rejected.
- `@Type(() => Number)` is also inactive, but JSON numbers arrive as numbers natively.

### Shared helpers

- **`tests/utils/auth.ts`** — `signUpAs()` creates a client user via `/auth/signup` and returns tokens.
- **`tests/utils/setup.ts`** — `createUserWithRole()` creates a tenant, signs up a user, then promotes the DB record to the given role + tenant. Returns a fresh JWT that reflects the updated role.
- **`tests/utils/db.ts`** — `resetDb()` truncates all application tables. Guarded: refuses to run against anything other than `real-estate-test-db`.

### What paginated endpoints return

| Endpoint | Response shape |
|----------|----------------|
| `GET /user` | `{ users, total, page, limit }` |
| `GET /properties` | `{ properties, total }` |
| `GET /properties/:id/reservations` | `{ data, total }` |
| `GET /properties/:id/costs` | `{ data, total }` |

### Auth flow for role tests

Public signup (`POST /auth/signup`) always creates a `CLIENT`-role user. To test ADMIN/SUPERADMIN/EMPLOYEE behaviour, the `createUserWithRole` helper:

1. Creates a tenant row via Prisma.
2. Signs up via `/auth/signup` (creates CLIENT user).
3. Updates the user's `role` and `id_tenant` directly in the DB.
4. Signs in again to obtain a JWT that encodes the updated role.

This avoids needing a SUPERADMIN bootstrap endpoint while still testing through the live HTTP layer.

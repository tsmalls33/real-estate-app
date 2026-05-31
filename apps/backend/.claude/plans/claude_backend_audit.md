# Backend Audit — Fix Tracker
> Generated: 2026-02-22 | Last updated: 2026-02-26

---

## Status Overview

| # | Branch | Scope | Status |
|---|--------|-------|--------|
| 1 | `fix/agent-payment-module` | Register dead module | ✅ Done |
| 2 | `fix/security` | Enumeration, guards, validation | ✅ Done |
| 3 | `fix/dead-code` | Remove unused service/repo/DTO | ✅ Done |
| 4 | `fix/soft-deletes` | Hard deletes, isDeleted consistency | ✅ Done |
| 5 | `feat/reservation-crud` | Full CRUD + overlap guard + pagination | ✅ Done (unmerged) |
| 6 | `feat/property-stats` | Create/update PropertyStats endpoints | ✅ Done (unmerged) |
| 7 | `fix/multi-tenancy` | tenantId in JWT, tenant scoping on schema | ✅ Done |
| 8 | `feat/users-me` | GET /users/me, fix auth/profile | ✅ Done |
| 9 | `fix/code-quality` | Types, exceptions, HTTP methods, imports, pagination | ✅ Done |
| 10 | `fix/fee-rule` | Remove or implement FeeRule | ⬜ Pending |
| 11 | `feat/agent-payment-reservation-link` | Add id_reservation FK to AgentPayment | ⬜ Pending |
| 12 | `feat/packages-types` | Add missing shared types to @RealEstate/types | 🟡 Partial |
| 13 | `feat/property-status-automation` | Auto-manage PropertyStatus on reservation transitions | ⬜ Pending |

---

## Groups

---

### 1 — `fix/agent-payment-module` ✅
> One-liner. AgentPaymentModule exists but is never imported — all `/agent-payments` routes are 404.

- [x] Add `AgentPaymentModule` to `imports[]` in `src/app.module.ts`

---

### 2 — `fix/security` ✅
> Auth and input safety issues. No schema changes needed.

- [x] `src/auth/auth.service.ts` — generic `UnauthorizedException('Invalid credentials')` for unknown email, missing password hash, and wrong password
- [x] `src/user/user.controller.ts` — `GET /user/:id` and `PUT /user/:id` now have `@UseGuards(AuthGuard, RolesGuard)` + `@Roles(ADMIN, SUPERADMIN)`
- [x] `src/main.ts` — `whitelist: true`
- [x] `src/user/user.service.ts` — `console.log` removed

---

### 3 — `fix/dead-code` ✅
> Remove code that is no longer called. No behaviour change.

- [x] `src/property/property.service.ts:69–79` — Remove `findCosts()` method (controller calls `CostService` directly now)
- [x] `src/property/property.repository.ts:120–145` — Remove `findCosts()` method
- [x] `src/property/dto/get-costs-query-params.ts` — Delete this file (duplicate of `src/cost/dto/get-costs-query-params.ts`, unused)

---

### 4 — `fix/soft-deletes` ✅
> Make soft-delete behaviour consistent across all entities that have `isDeleted`.

- [x] `src/tenant/tenant.repository.ts:54` — `delete()` is a hard delete. Replace with `update({ isDeleted: true })`. Add `softDelete()` method, update `TenantService.remove()` to call it
- [x] `src/user/user.repository.ts:84` — Same: `delete()` is hard delete. Use `softDelete()` that already exists at line 91 instead
- [x] `src/user/user.repository.ts:27` — `findAll()` missing `where: { isDeleted: false }` filter
- [x] `src/user/user.repository.ts:39` — `findById()` missing `isDeleted: false` filter (currently finds deleted users)
- [x] `src/property/property.repository.ts:68` — `existsById()` missing `isDeleted: false` — operations on soft-deleted properties silently succeed
- [x] `src/user/user.repository.ts:68` — `existsById()` same issue
- [x] Schema: `Client` uses `isActive: Boolean` as soft-delete marker; all other entities use `isDeleted: Boolean`. Migrate `Client.isActive` → `Client.isDeleted`, update `ClientRepository.softDelete()` and all `isActive` filters accordingly. `Plan` also uses `isActive` but semantically it means something different (a plan can be inactive without being deleted) — leave `Plan.isActive` as-is

---

### 5 — `feat/reservation-crud` ✅
> Core domain object. Nothing works without this.

- [x] Add `ReservationService` + `ReservationRepository` to `src/reservation/`
- [x] `POST /properties/:id_property/reservations` — create reservation; validate property exists and is not deleted
- [x] Date overlap guard in `ReservationService.create()` — query existing reservations for the same property with status `UPCOMING` or `ACTIVE`, reject if `startDate`/`endDate` overlaps
- [x] `GET /reservations/:id_reservation` — fetch single reservation
- [x] `PATCH /reservations/:id_reservation` — update `guestName`, `numberOfGuests`, `startDate`, `endDate`, `platform`, `totalCost`; blocks updates on CANCELLED/COMPLETED; re-validates date overlap
- [x] `PATCH /reservations/:id_reservation/status` — transition `UPCOMING → ACTIVE → COMPLETED`; disallow invalid transitions
- [x] `PATCH /reservations/:id_reservation/cancel` — set `status: CANCELLED`, set `dateCancelled: now()`
- [x] Add `page`/`limit` to `GetReservationsQueryParams` (`src/property/dto/get-reservations-query-params.ts`) and wire into `PropertyRepository.findReservations()` (now returns `{data, total}`)
- [x] `ReservationModule` registered providers + exports `ReservationService`; `AppModule` already imported `ReservationModule` — no change needed
- [x] Add `CreateReservationDto`, `UpdateReservationDto`, `UpdateReservationStatusDto`, `ReservationResponseDto`, `ReservationStatus` enum, `Platform` enum to `packages/types`
- [x] `PropertyModule` imports `ReservationModule`; `PropertyController` injects `ReservationService` for the create route

---

### 6 — `feat/property-stats` ✅
> Every property returns `propertyStats: null`. FE can't show any listing details.

- [x] `POST /properties/:id_property/stats` — create `PropertyStats` record (one per property; 409 if already exists, 404 if property not found)
- [x] `PATCH /properties/:id_property/stats` — update any stats fields
- [x] Add `PropertyStatsService` + `PropertyStatsRepository` — registered as providers in `PropertyModule`
- [x] `PropertyStats` already in `PROPERTY_DETAIL_SELECT` — no projection changes needed
- [x] Add `CreatePropertyStatsDto`, `UpdatePropertyStatsDto`, `PropertyStatsResponseDto`, `PropertyType` enum to `packages/types`

---

### 7 — `fix/multi-tenancy` ✅
> Foundation of the SaaS model. Without this, all data is shared across tenants.

- [x] `src/auth/auth.service.ts` — `tenantId: user.id_tenant` added to JWT payload in both `signIn` and `refreshToken`
- [x] Schema: `id_tenant String?` added to `Client` model + migration applied
- [x] Schema: `id_tenant String?` added to `AgentPayment` model + migration applied
- [x] Schema: `Property.propertyName @unique` → `@@unique([propertyName, id_tenant])`
- [x] `ClientRepository.findAll()` + `AgentPaymentRepository.findAll()` + `PropertyService.findAll()` scope by `tenantId` from JWT
- [x] `auth.guard.ts` — no changes needed; JWT payload already assigned to `req.user`

---

### 8 — `feat/users-me` ✅
> FE needs to fetch the logged-in user's profile immediately after login.

- [x] Add `GET /user/me` to `UserController` — reads `sub` from JWT, returns full user record
- [x] `GET /auth/profile` removed

---

### 9 — `fix/code-quality` ✅
> Consistency fixes. No behaviour change for correct inputs.

- [x] `src/agent-payment/agent-payment.repository.ts` — `existsById()` returns `boolean`
- [x] `src/tenant/tenant.service.ts` — `ConflictException` → `BadRequestException` for "no fields to update"
- [x] `src/plan/plan.service.ts` — same exception fix
- [x] `src/user/user.controller.ts` — `PUT` → `PATCH`
- [x] `src/tenant/tenant.controller.ts` — `PUT` → `PATCH`
- [x] Absolute `src/` → relative `../` imports in: `client.repository.ts`, `client.module.ts`, `agent-payment.repository.ts`, `agent-payment.module.ts`, `cost.repository.ts`
- [x] `src/user/user.service.ts` — `findAll()` paginated via `findWithPagination()`; `GetUsersQueryParams` DTO added

---

### 10 — `fix/fee-rule` 🟡
> FeeRule is in schema and appears in property detail responses but can never be managed.

**Decision needed:** implement or remove.
- [ ] **If removing:** drop `FeeRule` model from schema + migration, remove `feeRules` from `PROPERTY_DETAIL_SELECT`, remove from `Property` relation
- [ ] **If implementing:** add `GET/POST/PATCH/DELETE /fee-rules` + `POST /properties/:id/fee-rules/:id` (assign) + `DELETE /properties/:id/fee-rules/:id` (unassign)

---

### 11 — `feat/agent-payment-reservation-link` 🟠
> AgentPayments are currently free-floating — no link to the reservation or property that generated them.

- [ ] Schema: Add optional `id_reservation String?` FK to `AgentPayment` + migration
- [ ] Update `CreateAgentPaymentDto` to accept optional `id_reservation`
- [ ] Update `AgentPaymentRepository.create()` and projection to include it
- [ ] Optional: add a service method `AgentPaymentService.createFromReservation(id_reservation)` that auto-calculates `amount = reservation.totalCost × property.agentFeePercentage`

---

### 12 — `feat/packages-types` 🟡
> FE has no type-safe DTOs for the core domain objects.

- [x] `Reservation` types: done in group 5 — `CreateReservationDto`, `UpdateReservationDto`, `UpdateReservationStatusDto`, `ReservationResponseDto`, `ReservationStatus` enum, `Platform` enum
- [x] `PropertyStats` types: done in group 6 — `CreatePropertyStatsDto`, `UpdatePropertyStatsDto`, `PropertyStatsResponseDto`, `PropertyType` enum
- [ ] `Property` types: `CreatePropertyDto`, `UpdatePropertyDto`, `PropertyResponseDto`, `PropertyStatus` enum, `SaleType` enum
- [ ] `Client` types: `CreateClientDto`, `UpdateClientDto`, `ClientResponseDto`

---

### 13 — `feat/property-status-automation` 🟠
> Group 5 is done — this is now unblocked.

- [ ] In `ReservationService.updateStatus()`: when transitioning to `ACTIVE` → set `Property.status = UNDER_RENTAL`
- [ ] In `ReservationService.updateStatus()` and `cancel()`: when transitioning to `COMPLETED` or `CANCELLED` → set `Property.status = AVAILABLE_RENTAL` only if no other ACTIVE reservation exists for the property
- [ ] `PropertyRepository` needs a `updateStatus(id_property, status)` method; `PropertyModule` already imports `ReservationModule` — add inverse export of `PropertyService` from `PropertyModule` and inject into `ReservationService`, or add a direct Prisma call in `ReservationRepository` to avoid circular deps

---

## Verdict

**Getting close to frontend v1.**

Groups 1–9 complete (9/13, two pending merge). Remaining work: 10, 11, partial 12, 13.

**Open branches (not yet merged to main):**
- `feat/property-stats` — branched from `fix/code-quality`; merge after `fix/code-quality` is merged
- `feat/reservation-crud` — branched from `main`; ready to PR

Priority order: **10 (decision) → 13 → 11 → 12 (remaining Property + Client types)**

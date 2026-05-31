# Real Estate App

Monorepo containing the NestJS backend, React frontend, and shared TypeScript types.

## Structure

```
apps/
  backend/    (@RealEstate/backend)  — NestJS REST API, Prisma ORM, PostgreSQL
  frontend/   (@RealEstate/frontend) — React SPA
packages/
  types/      (@RealEstate/types)    — Shared DTOs and types consumed by both apps
```

## Prerequisites

- Node.js ≥ 22.17.1
- [pnpm](https://pnpm.io) — `npm install -g pnpm`
- Docker (for the local database)

## First-time setup

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Start the PostgreSQL container
pnpm --filter @RealEstate/backend run start:dev:db

# 3. Run migrations and seed the database
cd apps/backend
npx prisma migrate dev
pnpm run db:seed
cd ../..
```

## Running the app

The database must be running before starting either app.

**Start everything at once (from repo root):**
```bash
pnpm dev
```

**Or start each app individually:**
```bash
# Backend (port 3001)
pnpm --filter @RealEstate/backend run start:dev

# Frontend (port 3000) — in a separate terminal
pnpm --filter @RealEstate/frontend run start
```

| App      | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:3001        |
| Swagger  | http://localhost:3001/api    |

## Environment variables

**Backend** — `apps/backend/.env`:
```
DATABASE_URL=postgresql://postgres:1234@localhost:5432/real-estate-db?schema=public
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=10
```

**Frontend** — `apps/frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:3001
```

## Common commands

### Backend
```bash
pnpm --filter @RealEstate/backend run start:dev       # Watch mode
pnpm --filter @RealEstate/backend run start:dev:db    # Start DB container
pnpm --filter @RealEstate/backend run test            # Unit tests
pnpm --filter @RealEstate/backend run lint            # Lint

# Run from apps/backend/
npx prisma migrate dev        # Create and apply a migration
npx prisma generate           # Regenerate Prisma client after schema changes
npx prisma studio             # Open DB UI
pnpm run db:seed              # Seed the database
```

### Frontend
```bash
pnpm --filter @RealEstate/frontend run start          # Dev server
pnpm --filter @RealEstate/frontend run build          # Production build
pnpm --filter @RealEstate/frontend run test           # Tests
```

### Shared types
```bash
# Run from packages/types/ after editing any type
pnpm run build
```
> Both apps consume the compiled output from `packages/types/dist/`. Rebuild types whenever you make changes there.

### Root
```bash
pnpm dev        # Start backend + frontend concurrently (via Turborepo)
pnpm build      # Build all packages and apps in dependency order
pnpm test       # Run all tests
pnpm lint       # Lint all workspaces
```

#!/bin/bash
# One-command local API integration test runner.
# Ensures the dev Postgres container is up, the test database exists and is
# migrated, then runs the integration suite. Idempotent — safe to re-run.
#
# CI does NOT use this: the backend-integration job provisions Postgres via a
# GitHub Actions services container and runs the steps explicitly.
set -euo pipefail

cd "$(dirname "$0")/.."

DB_CONTAINER="real-estate-database"
TEST_DB="real-estate-test-db"
TEST_DB_URL="postgresql://postgres:1234@localhost:5432/${TEST_DB}?schema=public"

# 1. Ensure the dev Postgres container is running (reuses the dev DB server).
./scripts/start-dev-db.sh

# 2. Wait until Postgres accepts connections.
echo "Waiting for Postgres..."
until docker exec "$DB_CONTAINER" pg_isready -U postgres -q; do
  sleep 0.5
done

# 3. Create the test database if it doesn't exist yet (separate from dev DB).
if ! docker exec "$DB_CONTAINER" psql -U postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname='${TEST_DB}'" | grep -q 1; then
  echo "Creating test database '${TEST_DB}'..."
  docker exec "$DB_CONTAINER" createdb -U postgres "$TEST_DB"
fi

# 4. Generate the Prisma client and apply migrations to the test DB.
#    (Prisma CLI loads .env — point it at the test DB explicitly.)
pnpm exec prisma generate
DATABASE_URL="$TEST_DB_URL" pnpm exec prisma migrate deploy

# 5. Run the suite. Jest loads .env.test (via tests/setup-test-env.ts) itself.
#    Any args are forwarded to jest as a file/name filter, e.g.
#    `pnpm run test:api app` runs only specs whose path matches "app".
pnpm run test:integration -- "$@"

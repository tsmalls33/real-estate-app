import { PrismaClient } from '@prisma/client';

/**
 * The ONLY database name `resetDb` is allowed to truncate. This is a hard
 * safety guard: it prevents a misconfigured `.env.test` (e.g. one that still
 * points at the dev database `real-estate-db`) from wiping real local data.
 */
const TEST_DB_NAME = 'real-estate-test-db';

/**
 * Truncate every application table in the public schema (preserving the
 * `_prisma_migrations` ledger) so each test starts from a clean slate.
 *
 * GUARDED: refuses to run unless the live connection is the dedicated test
 * database. Do not remove the guard.
 */
export async function resetDb(prisma: PrismaClient): Promise<void> {
  const [{ current_database }] = await prisma.$queryRaw<
    { current_database: string }[]
  >`SELECT current_database()`;

  if (current_database !== TEST_DB_NAME) {
    throw new Error(
      `resetDb refused to run: connected to "${current_database}", ` +
        `but truncation is only permitted against "${TEST_DB_NAME}". ` +
        `Check DATABASE_URL in apps/backend/.env.test.`,
    );
  }

  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;

  const targets = tables
    .map((t) => t.tablename)
    .filter((name) => name !== '_prisma_migrations');

  if (targets.length === 0) return;

  const quoted = targets.map((name) => `"${name}"`).join(', ');
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`,
  );
}

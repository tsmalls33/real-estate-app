import { config } from 'dotenv';
import { resolve } from 'path';

// Runs via Jest `setupFiles` BEFORE AppModule (and thus ConfigModule) compiles,
// so the test DATABASE_URL is in process.env before ConfigModule loads `.env`.
// Resolve relative to this file (rootDir-independent of cwd).
//
// Locally we `override` so `.env.test` wins over any stray shell DATABASE_URL
// (e.g. one pointing at the dev DB). In CI we must NOT override: the
// backend-integration job sets DATABASE_URL via job-level env (different
// Postgres credentials) and that has to take precedence.
config({
  path: resolve(__dirname, '../.env.test'),
  override: !process.env.CI,
});

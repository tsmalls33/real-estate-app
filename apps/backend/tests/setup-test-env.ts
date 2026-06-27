import { config } from 'dotenv';
import { resolve } from 'path';

// Runs via Jest `setupFiles` BEFORE AppModule (and thus ConfigModule) compiles.
// dotenv defaults to override:false, so the test DATABASE_URL set here is
// already in process.env when ConfigModule later loads `.env`, and is not
// clobbered. Resolve relative to this file (rootDir-independent of cwd).
config({ path: resolve(__dirname, '../.env.test') });

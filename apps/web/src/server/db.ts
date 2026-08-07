import { createDatabase, type Database } from '@camisetas/db';
import { env } from './env';

declare global {
  var __camisetasDb: Database | undefined;
}

/**
 * Reusing the client across hot reloads and warm invocations keeps Neon's connection count
 * within the free tier allowance.
 */
export const db: Database = globalThis.__camisetasDb ?? createDatabase(env.DATABASE_URL);

if (env.NODE_ENV !== 'production') {
  globalThis.__camisetasDb = db;
}

import { createDatabase, type Database } from '@camisetas/db';
import { DomainError } from '@camisetas/core';
import { env } from './env';

declare global {
  var __camisetasDb: Database | undefined;
}

export const isDatabaseConfigured = env.DATABASE_URL !== undefined;

const connect = (): Database => {
  if (env.DATABASE_URL === undefined) {
    throw new DomainError(
      'internal_error',
      'La base de datos no está configurada en este entorno.',
    );
  }
  return createDatabase(env.DATABASE_URL);
};

/**
 * The connection is created on first use rather than at import, so a deployment without
 * DATABASE_URL still boots. Reusing it across warm invocations keeps the connection count within
 * the provider's free tier.
 */
const resolveDatabase = (): Database => {
  const existing = globalThis.__camisetasDb;
  if (existing !== undefined) return existing;

  const created = connect();
  if (env.NODE_ENV !== 'production') globalThis.__camisetasDb = created;
  return created;
};

export const db: Database = new Proxy({} as Database, {
  get: (_target, property) => Reflect.get(resolveDatabase(), property) as unknown,
});

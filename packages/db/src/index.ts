import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export * as schema from './schema';
export type Database = ReturnType<typeof createDatabase>;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

/** Accepted by helpers that must work both standalone and inside a transaction. */
export type Queryable = Database | Transaction;

/**
 * Serverless invocations are short lived and Neon caps connections, so the pool stays small
 * and idle sockets are closed quickly.
 */
export const createDatabase = (connectionString: string) => {
  const client = postgres(connectionString, {
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    onnotice: () => {},
  });
  return drizzle(client, { schema });
};

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export * as schema from './schema';
export type Database = ReturnType<typeof createDatabase>;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

/** Accepted by helpers that must work both standalone and inside a transaction. */
export type Queryable = Database | Transaction;

/**
 * Serverless instances handle one request at a time, so a single connection is enough and
 * anything larger multiplies across instances. A long-running server is the opposite case and
 * needs a real pool, hence the override.
 */
const poolSize = () => {
  const configured = Number(process.env['DATABASE_POOL_SIZE']);
  return Number.isFinite(configured) && configured > 0 ? configured : 1;
};

export const createDatabase = (connectionString: string) => {
  const client = postgres(connectionString, {
    max: poolSize(),
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
    // Required by connection poolers, which cannot replay prepared statements.
    prepare: false,
    onnotice: () => {},
  });
  return drizzle(client, { schema });
};

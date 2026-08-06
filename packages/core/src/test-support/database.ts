import { sql } from 'drizzle-orm';
import { createDatabase, type Database } from '@camisetas/db';

const connectionString = process.env['TEST_DATABASE_URL'];

if (connectionString === undefined) {
  throw new Error(
    'TEST_DATABASE_URL is required. Start the local database with `docker compose up -d`.',
  );
}

export const testDb: Database = createDatabase(connectionString);

/** Truncating users cascades to every owned table, keeping tests order-independent. */
export const resetDatabase = async (): Promise<void> => {
  await testDb.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
};

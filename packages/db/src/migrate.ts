import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const connectionString = process.env['DATABASE_URL'];
if (connectionString === undefined) {
  throw new Error('DATABASE_URL is required to run migrations.');
}

const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), '../drizzle');

const client = postgres(connectionString, { max: 1 });

try {
  console.warn(`Applying migrations from ${migrationsFolder}`);
  await migrate(drizzle(client), { migrationsFolder });
  console.warn('Migrations applied.');
} finally {
  await client.end();
}

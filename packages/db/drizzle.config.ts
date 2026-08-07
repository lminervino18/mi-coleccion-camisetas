import { defineConfig } from 'drizzle-kit';

const connectionString = process.env['DATABASE_URL'];
if (connectionString === undefined) {
  throw new Error('DATABASE_URL is required to generate or apply migrations.');
}

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: connectionString },
  strict: true,
  verbose: true,
});

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db, isDatabaseConfigured } from '@/server/db';
import { hasMailProvider, hasObjectStorage } from '@/server/env';

export const dynamic = 'force-dynamic';

/**
 * Reports what the deployment can actually do. Returns 503 when the database is unreachable so
 * an uptime check notices, while still describing which parts are degraded.
 */
export const GET = async () => {
  const startedAt = Date.now();

  let database: 'ok' | 'unreachable' | 'not_configured' = 'not_configured';
  if (isDatabaseConfigured) {
    try {
      await db.execute(sql`select 1`);
      database = 'ok';
    } catch {
      database = 'unreachable';
    }
  }

  const body = {
    status: database === 'ok' ? 'ok' : 'degraded',
    database,
    objectStorage: hasObjectStorage ? 'r2' : 'local',
    mail: hasMailProvider ? 'brevo' : 'log',
    checkedInMs: Date.now() - startedAt,
  };

  return NextResponse.json(body, {
    status: database === 'ok' ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
};

import { NextResponse } from 'next/server';
import {
  collectOrphanedUploads,
  deleteExpiredResetTokens,
  deleteExpiredSessions,
} from '@camisetas/core';
import { toErrorResponse } from '@/server/api';
import { db, isDatabaseConfigured } from '@/server/db';
import { logger, requestId } from '@/server/logger';
import { thumbnailKeyFor } from '@/server/images';
import { storage } from '@/server/storage';

export const dynamic = 'force-dynamic';

/**
 * Invoked by the daily cron in vercel.json. Vercel signs its own scheduled requests, so the only
 * guard needed is refusing to run when there is no database.
 */
export const GET = async () => {
  try {
    if (!isDatabaseConfigured) {
      return NextResponse.json({ skipped: 'database not configured' }, { status: 200 });
    }

    const orphans = await collectOrphanedUploads(db);

    await Promise.all(
      orphans.flatMap((objectKey) => [
        storage.remove(objectKey).catch(() => undefined),
        storage.remove(thumbnailKeyFor(objectKey)).catch(() => undefined),
      ]),
    );

    await deleteExpiredSessions(db);
    await deleteExpiredResetTokens(db);

    logger.info('Maintenance sweep finished', {
      requestId: await requestId(),
      orphanedUploads: orphans.length,
    });

    return NextResponse.json({ orphanedUploads: orphans.length });
  } catch (error) {
    return await toErrorResponse(error);
  }
};

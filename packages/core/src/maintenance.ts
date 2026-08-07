import { and, eq, lt } from 'drizzle-orm';
import type { Database } from '@camisetas/db';
import { schema } from '@camisetas/db';

const ORPHAN_AGE_HOURS = 24;

/**
 * An upload stays pending until a shirt or an avatar claims it. Anything still pending after a
 * day belongs to a flow the user abandoned, so the rows and their object keys are handed back
 * for deletion.
 */
export const collectOrphanedUploads = async (db: Database): Promise<string[]> => {
  const cutoff = new Date(Date.now() - ORPHAN_AGE_HOURS * 60 * 60 * 1000);

  const removed = await db
    .delete(schema.imageUploads)
    .where(
      and(eq(schema.imageUploads.status, 'pending'), lt(schema.imageUploads.createdAt, cutoff)),
    )
    .returning({ objectKey: schema.imageUploads.objectKey });

  return removed.map((row) => row.objectKey);
};

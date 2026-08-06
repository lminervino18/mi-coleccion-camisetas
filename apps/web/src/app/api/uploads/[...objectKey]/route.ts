import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { schema } from '@camisetas/db';
import { forbidden, notFound } from '@camisetas/core';
import { toErrorResponse } from '@/server/api';
import { requireUser } from '@/server/auth';
import { db } from '@/server/db';
import { processShirtImage, thumbnailKeyFor } from '@/server/images';
import { storage } from '@/server/storage';

type Params = { params: Promise<{ objectKey: string[] }> };

/**
 * Development-only receiver standing in for a direct upload to object storage. In production the
 * browser sends the file straight to R2 with a signed URL and never touches this route.
 */
export const PUT = async (request: Request, { params }: Params) => {
  try {
    const user = await requireUser();
    const objectKey = (await params).objectKey.join('/');

    const [upload] = await db
      .select()
      .from(schema.imageUploads)
      .where(
        and(eq(schema.imageUploads.objectKey, objectKey), eq(schema.imageUploads.userId, user.id)),
      )
      .limit(1);

    if (upload === undefined) throw notFound('Esa subida no existe.');
    if (upload.status !== 'pending') throw forbidden('Esa subida ya fue utilizada.');

    const processed = await processShirtImage(new Uint8Array(await request.arrayBuffer()));

    await storage.write(objectKey, processed.full.body, processed.full.contentType);
    await storage.write(
      thumbnailKeyFor(objectKey),
      processed.thumbnail.body,
      processed.thumbnail.contentType,
    );

    // Recording the dimensions here is what makes the upload claimable when a shirt is saved.
    await db
      .update(schema.imageUploads)
      .set({ width: processed.width, height: processed.height })
      .where(eq(schema.imageUploads.id, upload.id));

    return NextResponse.json({ width: processed.width, height: processed.height });
  } catch (error) {
    return toErrorResponse(error);
  }
};

import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { imageUploadTicketSchema, requestImageUploadSchema } from '@camisetas/contracts';
import { schema } from '@camisetas/db';
import { parseJson, toErrorResponse } from '@/server/api';
import { requireUser } from '@/server/auth';
import { db } from '@/server/db';
import { limitByClient } from '@/server/rate-limit';
import { shirtImageKey, storage } from '@/server/storage';

/**
 * Registers a pending upload and hands back a target for the browser. The row stays pending
 * until a shirt claims it, so abandoned uploads are recognisable and can be swept.
 */
export const POST = async (request: Request) => {
  try {
    const user = await requireUser();
    await limitByClient('uploads', 60, 60 * 60 * 1000);

    const input = await parseJson(request, requestImageUploadSchema);

    const uploadId = randomUUID();
    const objectKey = shirtImageKey(user.id, uploadId);

    await db.insert(schema.imageUploads).values({
      id: uploadId,
      userId: user.id,
      objectKey,
      contentType: input.contentType,
      byteSize: input.byteSize,
    });

    const target = await storage.createUploadTarget({
      objectKey,
      contentType: input.contentType,
      byteSize: input.byteSize,
    });

    return NextResponse.json(
      imageUploadTicketSchema.parse({ uploadId, uploadUrl: target.uploadUrl }),
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
};

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { userProfileSchema } from '@camisetas/contracts';
import { conflict } from '@camisetas/core';
import { schema } from '@camisetas/db';
import { parseJson, toErrorResponse } from '@/server/api';
import { requireUser } from '@/server/auth';
import { db } from '@/server/db';
import { toUserProfile } from '@/server/serializers';
import { thumbnailKeyFor } from '@/server/images';
import { storage } from '@/server/storage';

const claimAvatarSchema = z.object({ imageUploadId: z.string().uuid() });

export const PUT = async (request: Request) => {
  try {
    const user = await requireUser();
    const { imageUploadId } = await parseJson(request, claimAvatarSchema);

    const [upload] = await db
      .update(schema.imageUploads)
      .set({ status: 'confirmed' })
      .where(eq(schema.imageUploads.id, imageUploadId))
      .returning({
        objectKey: schema.imageUploads.objectKey,
        userId: schema.imageUploads.userId,
        width: schema.imageUploads.width,
      });

    if (upload === undefined || upload.userId !== user.id || upload.width === null) {
      throw conflict('La imagen ya no está disponible. Subila de nuevo.');
    }

    const previousKey = user.avatarKey;

    const [updated] = await db
      .update(schema.users)
      .set({ avatarKey: upload.objectKey, updatedAt: new Date() })
      .where(eq(schema.users.id, user.id))
      .returning();

    if (updated === undefined) throw conflict('No pudimos guardar la foto.');

    if (previousKey !== null) {
      await Promise.all([
        storage.remove(previousKey).catch(() => undefined),
        storage.remove(thumbnailKeyFor(previousKey)).catch(() => undefined),
      ]);
    }

    return NextResponse.json(userProfileSchema.parse(toUserProfile(updated)));
  } catch (error) {
    return toErrorResponse(error);
  }
};

export const DELETE = async () => {
  try {
    const user = await requireUser();

    const [updated] = await db
      .update(schema.users)
      .set({ avatarKey: null, updatedAt: new Date() })
      .where(eq(schema.users.id, user.id))
      .returning();

    if (updated === undefined) throw conflict('No pudimos quitar la foto.');

    if (user.avatarKey !== null) {
      await Promise.all([
        storage.remove(user.avatarKey).catch(() => undefined),
        storage.remove(thumbnailKeyFor(user.avatarKey)).catch(() => undefined),
      ]);
    }

    return NextResponse.json(userProfileSchema.parse(toUserProfile(updated)));
  } catch (error) {
    return toErrorResponse(error);
  }
};

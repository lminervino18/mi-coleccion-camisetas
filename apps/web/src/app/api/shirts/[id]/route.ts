import { NextResponse } from 'next/server';
import { shirtSchema, updateShirtSchema } from '@camisetas/contracts';
import { deleteShirt, getShirt, updateShirt } from '@camisetas/core';
import { parseJson, toErrorResponse } from '@/server/api';
import { requireUser } from '@/server/auth';
import { db } from '@/server/db';
import { toShirt } from '@/server/serializers';
import { thumbnailKeyFor } from '@/server/images';
import { storage } from '@/server/storage';

type Params = { params: Promise<{ id: string }> };

export const GET = async (_request: Request, { params }: Params) => {
  try {
    const user = await requireUser();
    const shirt = await getShirt(db, user.id, (await params).id);
    return NextResponse.json(shirtSchema.parse(toShirt(shirt)));
  } catch (error) {
    return toErrorResponse(error);
  }
};

export const PUT = async (request: Request, { params }: Params) => {
  try {
    const user = await requireUser();
    const input = await parseJson(request, updateShirtSchema);
    const shirt = await updateShirt(db, user.id, (await params).id, input);
    return NextResponse.json(shirtSchema.parse(toShirt(shirt)));
  } catch (error) {
    return toErrorResponse(error);
  }
};

export const DELETE = async (_request: Request, { params }: Params) => {
  try {
    const user = await requireUser();
    const imageKey = await deleteShirt(db, user.id, (await params).id);

    // The row is already gone; a failure to remove the object must not fail the request.
    await Promise.all([
      storage.remove(imageKey).catch(() => undefined),
      storage.remove(thumbnailKeyFor(imageKey)).catch(() => undefined),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
};

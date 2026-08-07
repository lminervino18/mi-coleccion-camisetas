import { NextResponse } from 'next/server';
import { toggleFavorite } from '@camisetas/core';
import { toErrorResponse } from '@/server/api';
import { requireUser } from '@/server/auth';
import { db } from '@/server/db';

type Params = { params: Promise<{ id: string }> };

export const POST = async (_request: Request, { params }: Params) => {
  try {
    const user = await requireUser();
    const isFavorite = await toggleFavorite(db, user.id, (await params).id);
    return NextResponse.json({ isFavorite });
  } catch (error) {
    return await toErrorResponse(error);
  }
};

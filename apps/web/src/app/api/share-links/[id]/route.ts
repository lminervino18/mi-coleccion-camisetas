import { NextResponse } from 'next/server';
import { revokeShareLink } from '@camisetas/core';
import { toErrorResponse } from '@/server/api';
import { requireUser } from '@/server/auth';
import { db } from '@/server/db';

type Params = { params: Promise<{ id: string }> };

export const DELETE = async (_request: Request, { params }: Params) => {
  try {
    const user = await requireUser();
    await revokeShareLink(db, user.id, (await params).id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
};

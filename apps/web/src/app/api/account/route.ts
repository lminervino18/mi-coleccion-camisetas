import { NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteAccount } from '@camisetas/core';
import { parseJson, toErrorResponse } from '@/server/api';
import { endSession, requireUser } from '@/server/auth';
import { db } from '@/server/db';

const deleteAccountSchema = z.object({ password: z.string().min(1) });

export const DELETE = async (request: Request) => {
  try {
    const user = await requireUser();
    const { password } = await parseJson(request, deleteAccountSchema);

    await deleteAccount(db, user.id, password);
    await endSession();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
};

import { NextResponse } from 'next/server';
import { changePasswordSchema } from '@camisetas/contracts';
import { changePassword, revokeOtherSessions } from '@camisetas/core';
import { parseJson, toErrorResponse } from '@/server/api';
import { getSessionToken, requireUser } from '@/server/auth';
import { db } from '@/server/db';
import { limitByClient } from '@/server/rate-limit';

export const POST = async (request: Request) => {
  try {
    const user = await requireUser();
    await limitByClient('change-password', 10, 60 * 60 * 1000);

    const input = await parseJson(request, changePasswordSchema);
    await changePassword(db, user.id, input.currentPassword, input.newPassword);

    // Anyone holding an older session on another device is signed out.
    const currentToken = await getSessionToken();
    if (currentToken !== undefined) await revokeOtherSessions(db, user.id, currentToken);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
};

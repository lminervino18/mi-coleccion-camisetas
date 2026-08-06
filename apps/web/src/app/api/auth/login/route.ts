import { NextResponse } from 'next/server';
import { loginSchema, userProfileSchema } from '@camisetas/contracts';
import { authenticate } from '@camisetas/core';
import { parseJson, toErrorResponse } from '@/server/api';
import { startSession } from '@/server/auth';
import { enforceRateLimit, limitByClient } from '@/server/rate-limit';
import { db } from '@/server/db';
import { toUserProfile } from '@/server/serializers';

export const POST = async (request: Request) => {
  try {
    const input = await parseJson(request, loginSchema);

    // Limited per address and per account so neither credential stuffing nor targeting a
    // single user can run unbounded.
    await limitByClient('login', 20, 15 * 60 * 1000);
    enforceRateLimit(`login:user:${input.username.toLowerCase()}`, 10, 15 * 60 * 1000);

    const user = await authenticate(db, input.username, input.password);
    await startSession(user.id);

    return NextResponse.json(userProfileSchema.parse(toUserProfile(user)));
  } catch (error) {
    return toErrorResponse(error);
  }
};

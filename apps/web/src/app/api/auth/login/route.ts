import { NextResponse } from 'next/server';
import { loginSchema, userProfileSchema } from '@camisetas/contracts';
import { authenticate } from '@camisetas/core';
import { parseJson, toErrorResponse } from '@/server/api';
import { startSession } from '@/server/auth';
import { enforceRateLimit, limitByClient } from '@/server/rate-limit';
import { db } from '@/server/db';
import { toUserProfile } from '@/server/serializers';

const FAILED_ATTEMPTS_WINDOW_MS = 15 * 60 * 1000;

export const POST = async (request: Request) => {
  try {
    const input = await parseJson(request, loginSchema);
    const accountKey = `login:failures:${input.username.toLowerCase()}`;

    await limitByClient('login', 40, FAILED_ATTEMPTS_WINDOW_MS);
    // Checked with a zero-cost probe: only failures below count towards the account limit, so a
    // legitimate user signing in from several devices is never locked out.
    enforceRateLimit(accountKey, 10, FAILED_ATTEMPTS_WINDOW_MS, { increment: false });

    let user;
    try {
      user = await authenticate(db, input.username, input.password);
    } catch (error) {
      enforceRateLimit(accountKey, 10, FAILED_ATTEMPTS_WINDOW_MS);
      throw error;
    }

    await startSession(user.id);
    return NextResponse.json(userProfileSchema.parse(toUserProfile(user)));
  } catch (error) {
    return await toErrorResponse(error);
  }
};

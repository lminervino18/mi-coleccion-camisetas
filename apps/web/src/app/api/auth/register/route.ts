import { NextResponse } from 'next/server';
import { registerSchema, userProfileSchema } from '@camisetas/contracts';
import { registerUser } from '@camisetas/core';
import { parseJson, toErrorResponse } from '@/server/api';
import { startSession } from '@/server/auth';
import { limitByClient } from '@/server/rate-limit';
import { db } from '@/server/db';
import { toUserProfile } from '@/server/serializers';

export const POST = async (request: Request) => {
  try {
    // Generous enough for a shared address (a home, an office) while still bounding abuse.
    await limitByClient('register', 20, 60 * 60 * 1000);

    const input = await parseJson(request, registerSchema);
    const user = await registerUser(db, input);
    await startSession(user.id);

    return NextResponse.json(userProfileSchema.parse(toUserProfile(user)), { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
};

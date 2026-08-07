import { NextResponse } from 'next/server';
import { updateProfileSchema, userProfileSchema } from '@camisetas/contracts';
import { updateProfile } from '@camisetas/core';
import { parseJson, toErrorResponse } from '@/server/api';
import { requireUser } from '@/server/auth';
import { db } from '@/server/db';
import { toUserProfile } from '@/server/serializers';

export const GET = async () => {
  try {
    const user = await requireUser();
    return NextResponse.json(userProfileSchema.parse(toUserProfile(user)));
  } catch (error) {
    return await toErrorResponse(error);
  }
};

export const PUT = async (request: Request) => {
  try {
    const user = await requireUser();
    const input = await parseJson(request, updateProfileSchema);
    const updated = await updateProfile(db, user.id, input);
    return NextResponse.json(userProfileSchema.parse(toUserProfile(updated)));
  } catch (error) {
    return await toErrorResponse(error);
  }
};

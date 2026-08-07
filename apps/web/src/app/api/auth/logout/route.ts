import { NextResponse } from 'next/server';
import { toErrorResponse } from '@/server/api';
import { endSession } from '@/server/auth';

export const POST = async () => {
  try {
    await endSession();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
};

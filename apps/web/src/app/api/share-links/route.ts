import { NextResponse } from 'next/server';
import { createShareLinkSchema, shareLinkSchema } from '@camisetas/contracts';
import { createShareLink, listShareLinks } from '@camisetas/core';
import { parseJson, toErrorResponse } from '@/server/api';
import { appUrl, requireUser } from '@/server/auth';
import { db } from '@/server/db';
import { limitByClient } from '@/server/rate-limit';

export const GET = async () => {
  try {
    const user = await requireUser();
    const links = await listShareLinks(db, user.id);

    return NextResponse.json(
      links.map((link) => ({
        id: link.id,
        url: null,
        createdAt: link.createdAt.toISOString(),
        expiresAt: link.expiresAt?.toISOString() ?? null,
        revokedAt: link.revokedAt?.toISOString() ?? null,
      })),
    );
  } catch (error) {
    return await toErrorResponse(error);
  }
};

export const POST = async (request: Request) => {
  try {
    const user = await requireUser();
    await limitByClient('share-links', 20, 60 * 60 * 1000);

    const input = await parseJson(request, createShareLinkSchema);
    const { record, token } = await createShareLink(db, user.id, input.expiresInDays);

    return NextResponse.json(
      shareLinkSchema.parse({
        id: record.id,
        url: appUrl(`/c/${token}`),
        createdAt: record.createdAt.toISOString(),
        expiresAt: record.expiresAt?.toISOString() ?? null,
        revokedAt: null,
      }),
      { status: 201 },
    );
  } catch (error) {
    return await toErrorResponse(error);
  }
};

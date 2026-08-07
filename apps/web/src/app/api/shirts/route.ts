import { NextResponse } from 'next/server';
import { createShirtSchema, shirtFiltersSchema, shirtSchema } from '@camisetas/contracts';
import { createShirt, listShirts } from '@camisetas/core';
import { parseJson, parseQuery, toErrorResponse } from '@/server/api';
import { requireUser } from '@/server/auth';
import { db } from '@/server/db';
import { toShirt } from '@/server/serializers';

export const GET = async (request: Request) => {
  try {
    const user = await requireUser();
    const filters = parseQuery(request, shirtFiltersSchema);
    const page = await listShirts(db, user.id, filters);

    return NextResponse.json({
      items: page.items.map(toShirt),
      page: page.page,
      pageSize: page.pageSize,
      totalItems: page.totalItems,
      totalPages: page.totalPages,
    });
  } catch (error) {
    return await toErrorResponse(error);
  }
};

export const POST = async (request: Request) => {
  try {
    const user = await requireUser();
    const input = await parseJson(request, createShirtSchema);
    const shirt = await createShirt(db, user.id, input);

    return NextResponse.json(shirtSchema.parse(toShirt(shirt)), { status: 201 });
  } catch (error) {
    return await toErrorResponse(error);
  }
};

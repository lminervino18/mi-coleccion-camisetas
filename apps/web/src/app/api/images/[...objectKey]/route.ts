import { NextResponse } from 'next/server';
import { toErrorResponse } from '@/server/api';
import { storage } from '@/server/storage';

type Params = { params: Promise<{ objectKey: string[] }> };

/**
 * Serves stored images when no public bucket URL is configured. Images are immutable once
 * written, so they are cached aggressively.
 */
export const GET = async (_request: Request, { params }: Params) => {
  try {
    const objectKey = (await params).objectKey.join('/');
    const object = await storage.read(objectKey);

    if (object === null) {
      return NextResponse.json(
        { code: 'not_found', message: 'Imagen no encontrada.' },
        {
          status: 404,
        },
      );
    }

    return new NextResponse(Buffer.from(object.body), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
};

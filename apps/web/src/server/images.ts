import sharp from 'sharp';
import { detectImageMimeType, MAX_IMAGE_BYTES } from '@camisetas/contracts';
import { DomainError } from '@camisetas/core';

export type ProcessedImage = {
  full: { body: Uint8Array; contentType: string };
  thumbnail: { body: Uint8Array; contentType: string };
  width: number;
  height: number;
};

const FULL_MAX_EDGE = 1600;
const THUMBNAIL_MAX_EDGE = 600;
const MAX_SOURCE_EDGE = 12000;

/**
 * Validates and normalises an uploaded image. The declared content type is ignored in favour of
 * the file signature, EXIF rotation is baked in, and all other metadata is dropped so location
 * data never reaches a public URL.
 */
export const processShirtImage = async (source: Uint8Array): Promise<ProcessedImage> => {
  if (source.byteLength > MAX_IMAGE_BYTES) {
    throw new DomainError('payload_too_large', 'La imagen supera los 10 MB.');
  }

  if (detectImageMimeType(source) === null) {
    throw new DomainError('validation_failed', 'El archivo no es una imagen válida.');
  }

  const pipeline = sharp(Buffer.from(source), { failOn: 'error' }).rotate();

  const metadata = await pipeline.metadata().catch(() => null);
  if (metadata === null || metadata.width === undefined || metadata.height === undefined) {
    throw new DomainError('validation_failed', 'No pudimos leer la imagen.');
  }
  if (metadata.width > MAX_SOURCE_EDGE || metadata.height > MAX_SOURCE_EDGE) {
    throw new DomainError('validation_failed', 'La imagen tiene dimensiones excesivas.');
  }

  const full = await pipeline
    .clone()
    .resize({
      width: FULL_MAX_EDGE,
      height: FULL_MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const thumbnail = await pipeline
    .clone()
    .resize({
      width: THUMBNAIL_MAX_EDGE,
      height: THUMBNAIL_MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 72 })
    .toBuffer();

  return {
    full: { body: new Uint8Array(full.data), contentType: 'image/webp' },
    thumbnail: { body: new Uint8Array(thumbnail), contentType: 'image/webp' },
    width: full.info.width,
    height: full.info.height,
  };
};

export const thumbnailKeyFor = (objectKey: string): string => `${objectKey}-thumb`;

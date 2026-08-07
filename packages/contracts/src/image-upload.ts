import { z } from 'zod';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const imageMimeTypeSchema = z.enum(ACCEPTED_IMAGE_TYPES);
export type ImageMimeType = z.infer<typeof imageMimeTypeSchema>;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const requestImageUploadSchema = z.object({
  contentType: imageMimeTypeSchema,
  byteSize: z.number().int().positive().max(MAX_IMAGE_BYTES, 'La imagen supera los 10 MB.'),
});
export type RequestImageUploadInput = z.infer<typeof requestImageUploadSchema>;

export const imageUploadTicketSchema = z.object({
  uploadId: z.string().uuid(),
  uploadUrl: z.string().url(),
});
export type ImageUploadTicket = z.infer<typeof imageUploadTicketSchema>;

/**
 * Magic bytes for the accepted formats. The client-declared content type is never trusted:
 * the stored object is probed and rejected when the signature does not match.
 */
export const IMAGE_SIGNATURES: ReadonlyArray<{ mime: ImageMimeType; bytes: readonly number[] }> = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

export const detectImageMimeType = (header: Uint8Array): ImageMimeType | null => {
  for (const signature of IMAGE_SIGNATURES) {
    if (signature.bytes.every((byte, index) => header[index] === byte)) return signature.mime;
  }
  const isRiff = [0x52, 0x49, 0x46, 0x46].every((byte, index) => header[index] === byte);
  const isWebp = [0x57, 0x45, 0x42, 0x50].every((byte, index) => header[index + 8] === byte);
  return isRiff && isWebp ? 'image/webp' : null;
};

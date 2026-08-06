import { describe, expect, it } from 'vitest';
import { detectImageMimeType, requestImageUploadSchema } from './image-upload.js';

const header = (...bytes: number[]) => Uint8Array.from([...bytes, ...new Array(16).fill(0)]);

describe('detectImageMimeType', () => {
  it('detects jpeg', () => {
    expect(detectImageMimeType(header(0xff, 0xd8, 0xff, 0xe0))).toBe('image/jpeg');
  });

  it('detects png', () => {
    expect(detectImageMimeType(header(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe(
      'image/png',
    );
  });

  it('detects webp only when the RIFF container declares WEBP', () => {
    const bytes = header(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50);
    expect(detectImageMimeType(bytes)).toBe('image/webp');
  });

  it('rejects a RIFF container that is not webp', () => {
    const bytes = header(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x41, 0x56, 0x49, 0x20);
    expect(detectImageMimeType(bytes)).toBe(null);
  });

  it('rejects a renamed executable', () => {
    expect(detectImageMimeType(header(0x4d, 0x5a, 0x90, 0x00))).toBe(null);
  });

  it('rejects an empty header', () => {
    expect(detectImageMimeType(new Uint8Array())).toBe(null);
  });
});

describe('requestImageUploadSchema', () => {
  it('accepts a jpeg within the size limit', () => {
    expect(
      requestImageUploadSchema.safeParse({ contentType: 'image/jpeg', byteSize: 1024 }).success,
    ).toBe(true);
  });

  it('rejects an unsupported content type', () => {
    expect(
      requestImageUploadSchema.safeParse({ contentType: 'image/gif', byteSize: 1024 }).success,
    ).toBe(false);
  });

  it('rejects an image above 10 MB', () => {
    const result = requestImageUploadSchema.safeParse({
      contentType: 'image/png',
      byteSize: 10 * 1024 * 1024 + 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a zero byte upload', () => {
    expect(
      requestImageUploadSchema.safeParse({ contentType: 'image/png', byteSize: 0 }).success,
    ).toBe(false);
  });
});

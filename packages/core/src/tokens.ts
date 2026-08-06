import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const TOKEN_BYTES = 32;

/**
 * Opaque capability token. Callers keep the plain value and persist only its hash, so a
 * database dump cannot be replayed as a valid session or share link.
 */
export const generateToken = (): string => randomBytes(TOKEN_BYTES).toString('base64url');

export const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('base64url');

export const tokensMatch = (left: string, right: string): boolean => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

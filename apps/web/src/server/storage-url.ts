import { env, hasObjectStorage } from './env';

/**
 * Resolves the browser-facing URL for a stored object. Without R2 credentials the app serves
 * uploads from a local route so development works without cloud access.
 */
export const publicImageUrl = (objectKey: string): string => {
  if (hasObjectStorage && env.R2_PUBLIC_URL !== undefined) {
    return `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${objectKey}`;
  }
  return new URL(`/api/images/${objectKey}`, env.APP_URL).toString();
};

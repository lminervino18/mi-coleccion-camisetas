import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, resolve, sep } from 'node:path';
import { env } from '../env';
import type { ObjectStorage } from './types';

const ROOT = resolve(process.cwd(), '.uploads');

/**
 * Object keys come from our own code, but this still refuses any path that escapes the upload
 * root so a crafted key can never reach the filesystem outside it.
 */
const resolveWithinRoot = (objectKey: string): string => {
  const target = resolve(join(ROOT, normalize(objectKey)));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) {
    throw new Error('Object key escapes the storage root.');
  }
  return target;
};

/** Development stand-in for R2: the browser uploads through the app instead of to a bucket. */
export const localStorage: ObjectStorage = {
  // Absolute so the upload ticket has the same shape as a presigned bucket URL.
  createUploadTarget: ({ objectKey }) =>
    Promise.resolve({
      objectKey,
      uploadUrl: new URL(`/api/uploads/${objectKey}`, env.APP_URL).toString(),
    }),

  read: async (objectKey) => {
    try {
      const body = await readFile(resolveWithinRoot(objectKey));
      return { body: new Uint8Array(body), contentType: 'application/octet-stream' };
    } catch {
      return null;
    }
  },

  write: async (objectKey, body) => {
    const target = resolveWithinRoot(objectKey);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, body);
  },

  remove: async (objectKey) => {
    await rm(resolveWithinRoot(objectKey), { force: true });
  },
};

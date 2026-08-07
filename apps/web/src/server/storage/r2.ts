import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../env';
import type { ObjectStorage } from './types';

const UPLOAD_URL_TTL_SECONDS = 300;

const client = () =>
  new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID ?? ''}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? '',
    },
  });

const bucket = () => env.R2_BUCKET ?? '';

/**
 * Uploads go straight from the browser to R2 with a short-lived signed URL. Vercel caps request
 * bodies at 4.5 MB, so relaying image data through the app is not an option.
 */
export const r2Storage: ObjectStorage = {
  createUploadTarget: async ({ objectKey, contentType, byteSize }) => {
    const uploadUrl = await getSignedUrl(
      client(),
      new PutObjectCommand({
        Bucket: bucket(),
        Key: objectKey,
        ContentType: contentType,
        ContentLength: byteSize,
      }),
      { expiresIn: UPLOAD_URL_TTL_SECONDS },
    );
    return { objectKey, uploadUrl };
  },

  read: async (objectKey) => {
    try {
      const response = await client().send(
        new GetObjectCommand({ Bucket: bucket(), Key: objectKey }),
      );
      const body = await response.Body?.transformToByteArray();
      if (body === undefined) return null;
      return { body, contentType: response.ContentType ?? 'application/octet-stream' };
    } catch {
      return null;
    }
  },

  write: async (objectKey, body, contentType) => {
    await client().send(
      new PutObjectCommand({
        Bucket: bucket(),
        Key: objectKey,
        Body: body,
        ContentType: contentType,
      }),
    );
  },

  remove: async (objectKey) => {
    await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: objectKey }));
  },
};

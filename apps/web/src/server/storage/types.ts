import type { ImageMimeType } from '@camisetas/contracts';

export type StoredObject = {
  objectKey: string;
  /** Where the browser should PUT the file. Empty when the client posts through the app. */
  uploadUrl: string;
};

/**
 * Object storage seen by the application. Keeping this narrow is what allows R2 to be swapped
 * for a local folder in development without touching any use case.
 */
export type ObjectStorage = {
  createUploadTarget: (input: {
    objectKey: string;
    contentType: ImageMimeType;
    byteSize: number;
  }) => Promise<StoredObject>;
  read: (objectKey: string) => Promise<{ body: Uint8Array; contentType: string } | null>;
  write: (objectKey: string, body: Uint8Array, contentType: string) => Promise<void>;
  remove: (objectKey: string) => Promise<void>;
};

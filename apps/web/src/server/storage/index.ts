import { hasObjectStorage } from '../env';
import { localStorage } from './local';
import { r2Storage } from './r2';
import type { ObjectStorage } from './types';

export type { ObjectStorage } from './types';

export const storage: ObjectStorage = hasObjectStorage ? r2Storage : localStorage;

export const shirtImageKey = (userId: string, uploadId: string): string =>
  `shirts/${userId}/${uploadId}`;

export const avatarKey = (userId: string, uploadId: string): string =>
  `avatars/${userId}/${uploadId}`;

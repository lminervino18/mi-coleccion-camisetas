import { schema } from '@camisetas/db';
import type { CreateShirtInput } from '@camisetas/contracts';
import { registerUser } from '../accounts';
import { createShirt, type ShirtRecord } from '../shirts';
import { testDb } from './database';

let sequence = 0;

export const createTestUser = (suffix = 'principal') =>
  registerUser(testDb, {
    username: `usuario${suffix}`,
    email: `${suffix}@example.com`,
    password: 'una-contrasena-larga',
  });

/** Registers a pending upload so createShirt has something to claim. */
export const createPendingUpload = async (userId: string): Promise<string> => {
  sequence += 1;
  const [row] = await testDb
    .insert(schema.imageUploads)
    .values({
      userId,
      objectKey: `uploads/${userId}/${sequence}.jpg`,
      contentType: 'image/jpeg',
      byteSize: 1024,
      width: 800,
      height: 1000,
    })
    .returning({ id: schema.imageUploads.id });

  if (row === undefined) throw new Error('Could not create upload.');
  return row.id;
};

export const shirtInput = (
  overrides: Partial<CreateShirtInput> = {},
): Omit<CreateShirtInput, 'imageUploadId'> => ({
  kind: 'club',
  club: 'Celta de Vigo',
  league: 'La Liga',
  country: 'España',
  season: '2016/2017',
  kit: 'home',
  size: 'L',
  playerName: 'Iago Aspas',
  squadNumber: 10,
  colors: ['lightBlue'],
  notes: null,
  isFavorite: false,
  ...overrides,
});

export const addShirt = async (
  userId: string,
  overrides: Partial<CreateShirtInput> = {},
): Promise<ShirtRecord> => {
  const imageUploadId = await createPendingUpload(userId);
  return createShirt(testDb, userId, { ...shirtInput(overrides), imageUploadId });
};

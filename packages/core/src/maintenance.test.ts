import { beforeEach, describe, expect, it } from 'vitest';
import { schema } from '@camisetas/db';
import { resetDatabase, testDb } from './test-support/database';
import { createTestUser, addShirt } from './test-support/factories';
import { collectOrphanedUploads } from './maintenance';
import { deleteExpiredResetTokens } from './password-reset';
import { deleteExpiredSessions } from './sessions';

const insertUpload = async (userId: string, createdAt: Date, status: 'pending' | 'confirmed') => {
  const [row] = await testDb
    .insert(schema.imageUploads)
    .values({
      userId,
      objectKey: `uploads/${userId}/${createdAt.getTime()}-${status}`,
      contentType: 'image/jpeg',
      byteSize: 1024,
      width: 800,
      height: 1000,
      status,
      createdAt,
    })
    .returning({ objectKey: schema.imageUploads.objectKey });
  return row?.objectKey ?? '';
};

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

beforeEach(resetDatabase);

describe('collectOrphanedUploads', () => {
  it('returns the keys of stale pending uploads so they can be deleted from storage', async () => {
    const user = await createTestUser();
    const orphan = await insertUpload(user.id, daysAgo(3), 'pending');

    await expect(collectOrphanedUploads(testDb)).resolves.toEqual([orphan]);
  });

  it('leaves recent pending uploads alone', async () => {
    const user = await createTestUser();
    await insertUpload(user.id, new Date(), 'pending');

    await expect(collectOrphanedUploads(testDb)).resolves.toEqual([]);
    expect(await testDb.select().from(schema.imageUploads)).toHaveLength(1);
  });

  it('never touches an upload already attached to a shirt', async () => {
    const user = await createTestUser();
    await addShirt(user.id);
    await insertUpload(user.id, daysAgo(5), 'confirmed');

    await expect(collectOrphanedUploads(testDb)).resolves.toEqual([]);
    expect(await testDb.select().from(schema.imageUploads)).toHaveLength(2);
  });
});

describe('expiry sweeps', () => {
  it('remove nothing when everything is still valid', async () => {
    const user = await createTestUser();
    await insertUpload(user.id, new Date(), 'pending');

    await deleteExpiredSessions(testDb);
    await deleteExpiredResetTokens(testDb);

    expect(await testDb.select().from(schema.imageUploads)).toHaveLength(1);
  });
});

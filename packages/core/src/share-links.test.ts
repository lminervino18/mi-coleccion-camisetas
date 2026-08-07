import { beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { schema } from '@camisetas/db';
import { resetDatabase, testDb } from './test-support/database';
import { createTestUser } from './test-support/factories';
import { createShareLink, listShareLinks, resolveShareToken, revokeShareLink } from './share-links';
import { hashToken } from './tokens';

beforeEach(resetDatabase);

describe('createShareLink', () => {
  it('stores only the hash of the token', async () => {
    const user = await createTestUser();
    const { token, record } = await createShareLink(testDb, user.id, null);

    expect(record.tokenHash).toBe(hashToken(token));
    expect(record.tokenHash).not.toBe(token);
  });

  it('issues tokens with enough entropy to resist guessing', async () => {
    const user = await createTestUser();
    const { token } = await createShareLink(testDb, user.id, null);

    // The legacy implementation used 8 hexadecimal characters, i.e. 32 bits.
    expect(token.length).toBeGreaterThanOrEqual(43);
  });

  it('issues a different token every time', async () => {
    const user = await createTestUser();
    const first = await createShareLink(testDb, user.id, null);
    const second = await createShareLink(testDb, user.id, null);

    expect(first.token).not.toBe(second.token);
  });

  it('does not revoke previous links when a new one is created', async () => {
    const user = await createTestUser();
    const first = await createShareLink(testDb, user.id, null);
    await createShareLink(testDb, user.id, null);

    await expect(resolveShareToken(testDb, first.token)).resolves.not.toBe(null);
  });
});

describe('resolveShareToken', () => {
  it('returns the owner for a valid token', async () => {
    const user = await createTestUser();
    const { token } = await createShareLink(testDb, user.id, 30);

    await expect(resolveShareToken(testDb, token)).resolves.toMatchObject({ userId: user.id });
  });

  it('returns null for an unknown token', async () => {
    await expect(resolveShareToken(testDb, 'token-inventado')).resolves.toBe(null);
  });

  it('returns null once the link has expired', async () => {
    const user = await createTestUser();
    const { token } = await createShareLink(testDb, user.id, 1);

    await testDb
      .update(schema.shareLinks)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(schema.shareLinks.tokenHash, hashToken(token)));

    await expect(resolveShareToken(testDb, token)).resolves.toBe(null);
  });

  it('returns null once the link has been revoked', async () => {
    const user = await createTestUser();
    const { token, record } = await createShareLink(testDb, user.id, null);

    await revokeShareLink(testDb, user.id, record.id);

    await expect(resolveShareToken(testDb, token)).resolves.toBe(null);
  });

  it('stops resolving after the owner deletes the account', async () => {
    const user = await createTestUser();
    const { token } = await createShareLink(testDb, user.id, null);

    await testDb.delete(schema.users).where(eq(schema.users.id, user.id));

    await expect(resolveShareToken(testDb, token)).resolves.toBe(null);
  });

  it('never exposes the owner email', async () => {
    const user = await createTestUser();
    const { token } = await createShareLink(testDb, user.id, null);

    const owner = await resolveShareToken(testDb, token);
    expect(owner).not.toHaveProperty('email');
  });
});

describe('revokeShareLink', () => {
  it('refuses to revoke a link owned by someone else', async () => {
    const owner = await createTestUser('duenio');
    const intruder = await createTestUser('intruso');
    const { record, token } = await createShareLink(testDb, owner.id, null);

    await expect(revokeShareLink(testDb, intruder.id, record.id)).rejects.toMatchObject({
      code: 'not_found',
    });
    await expect(resolveShareToken(testDb, token)).resolves.not.toBe(null);
  });

  it('is not repeatable once revoked', async () => {
    const user = await createTestUser();
    const { record } = await createShareLink(testDb, user.id, null);

    await revokeShareLink(testDb, user.id, record.id);
    await expect(revokeShareLink(testDb, user.id, record.id)).rejects.toMatchObject({
      code: 'not_found',
    });
  });
});

describe('listShareLinks', () => {
  it('lists only active links for the owner', async () => {
    const user = await createTestUser('duenio');
    const other = await createTestUser('otro');
    const active = await createShareLink(testDb, user.id, null);
    const revoked = await createShareLink(testDb, user.id, null);
    await createShareLink(testDb, other.id, null);

    await revokeShareLink(testDb, user.id, revoked.record.id);

    const links = await listShareLinks(testDb, user.id);
    expect(links.map((link) => link.id)).toEqual([active.record.id]);
  });
});

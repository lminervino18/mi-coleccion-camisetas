import { beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { schema } from '@camisetas/db';
import { resetDatabase, testDb } from './test-support/database';
import { createTestUser } from './test-support/factories';
import { authenticate } from './accounts';
import { createSession, resolveSession } from './sessions';
import { requestPasswordReset, resetPassword } from './password-reset';
import { hashToken } from './tokens';

beforeEach(resetDatabase);

describe('requestPasswordReset', () => {
  it('issues a token for a known address', async () => {
    const user = await createTestUser();
    const issued = await requestPasswordReset(testDb, user.email);

    expect(issued).not.toBe(null);
    expect(issued?.token.length).toBeGreaterThanOrEqual(43);
  });

  it('returns nothing for an unknown address so accounts cannot be enumerated', async () => {
    await expect(requestPasswordReset(testDb, 'nadie@example.com')).resolves.toBe(null);
  });

  it('stores only the hash of the token', async () => {
    const user = await createTestUser();
    const issued = await requestPasswordReset(testDb, user.email);

    const [row] = await testDb.select().from(schema.passwordResetTokens);
    expect(row?.tokenHash).toBe(hashToken(issued?.token ?? ''));
    expect(row?.tokenHash).not.toBe(issued?.token);
  });
});

describe('resetPassword', () => {
  it('replaces the password so the old one stops working', async () => {
    const user = await createTestUser();
    const issued = await requestPasswordReset(testDb, user.email);

    await resetPassword(testDb, issued?.token ?? '', 'una-contrasena-nueva');

    await expect(authenticate(testDb, user.username, 'una-contrasena-larga')).rejects.toMatchObject(
      { code: 'unauthenticated' },
    );
    await expect(
      authenticate(testDb, user.username, 'una-contrasena-nueva'),
    ).resolves.toMatchObject({ id: user.id });
  });

  it('cannot be used twice', async () => {
    const user = await createTestUser();
    const issued = await requestPasswordReset(testDb, user.email);

    await resetPassword(testDb, issued?.token ?? '', 'una-contrasena-nueva');

    await expect(
      resetPassword(testDb, issued?.token ?? '', 'otra-contrasena-mas'),
    ).rejects.toMatchObject({ code: 'validation_failed' });
  });

  it('rejects an expired token', async () => {
    const user = await createTestUser();
    const issued = await requestPasswordReset(testDb, user.email);

    await testDb
      .update(schema.passwordResetTokens)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(schema.passwordResetTokens.tokenHash, hashToken(issued?.token ?? '')));

    await expect(
      resetPassword(testDb, issued?.token ?? '', 'una-contrasena-nueva'),
    ).rejects.toMatchObject({ code: 'validation_failed' });
  });

  it('rejects an unknown token', async () => {
    await expect(
      resetPassword(testDb, 'token-inventado', 'una-contrasena-nueva'),
    ).rejects.toMatchObject({ code: 'validation_failed' });
  });

  it('signs out every existing session', async () => {
    const user = await createTestUser();
    const session = await createSession(testDb, user.id, null);
    const issued = await requestPasswordReset(testDb, user.email);

    await resetPassword(testDb, issued?.token ?? '', 'una-contrasena-nueva');

    await expect(resolveSession(testDb, session.token)).resolves.toBe(null);
  });

  it('leaves the password untouched when the token is rejected', async () => {
    const user = await createTestUser();

    await expect(
      resetPassword(testDb, 'token-inventado', 'una-contrasena-nueva'),
    ).rejects.toMatchObject({ code: 'validation_failed' });

    await expect(
      authenticate(testDb, user.username, 'una-contrasena-larga'),
    ).resolves.toMatchObject({ id: user.id });
  });
});

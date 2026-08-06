import { beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { schema } from '@camisetas/db';
import { resetDatabase, testDb } from './test-support/database';
import { registerUser } from './accounts';
import {
  createSession,
  deleteExpiredSessions,
  resolveSession,
  revokeOtherSessions,
  revokeSession,
} from './sessions';
import { hashToken } from './tokens';

const credentials = {
  username: 'lminervino18',
  email: 'loren@example.com',
  password: 'una-contrasena-larga',
};

const createUser = () => registerUser(testDb, credentials);

beforeEach(resetDatabase);

describe('createSession', () => {
  it('stores only the hash of the token', async () => {
    const user = await createUser();
    const { token } = await createSession(testDb, user.id, 'vitest');

    const [row] = await testDb
      .select({ tokenHash: schema.sessions.tokenHash })
      .from(schema.sessions)
      .where(eq(schema.sessions.userId, user.id));

    expect(row?.tokenHash).toBe(hashToken(token));
    expect(row?.tokenHash).not.toBe(token);
  });

  it('issues a different token each time', async () => {
    const user = await createUser();
    const first = await createSession(testDb, user.id, null);
    const second = await createSession(testDb, user.id, null);
    expect(first.token).not.toBe(second.token);
  });
});

describe('resolveSession', () => {
  it('returns the owner for a valid token', async () => {
    const user = await createUser();
    const { token } = await createSession(testDb, user.id, null);
    await expect(resolveSession(testDb, token)).resolves.toMatchObject({ id: user.id });
  });

  it('returns null for an unknown token', async () => {
    await expect(resolveSession(testDb, 'token-inventado')).resolves.toBe(null);
  });

  it('returns null once the session has expired', async () => {
    const user = await createUser();
    const { token } = await createSession(testDb, user.id, null);

    await testDb
      .update(schema.sessions)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(schema.sessions.tokenHash, hashToken(token)));

    await expect(resolveSession(testDb, token)).resolves.toBe(null);
  });

  it('never exposes the password hash', async () => {
    const user = await createUser();
    const { token } = await createSession(testDb, user.id, null);
    const resolved = await resolveSession(testDb, token);
    expect(resolved).not.toHaveProperty('passwordHash');
  });

  it('stops resolving after the user is deleted', async () => {
    const user = await createUser();
    const { token } = await createSession(testDb, user.id, null);
    await testDb.delete(schema.users).where(eq(schema.users.id, user.id));
    await expect(resolveSession(testDb, token)).resolves.toBe(null);
  });
});

describe('revokeSession', () => {
  it('invalidates the token immediately', async () => {
    const user = await createUser();
    const { token } = await createSession(testDb, user.id, null);

    await revokeSession(testDb, token);

    await expect(resolveSession(testDb, token)).resolves.toBe(null);
  });

  it('leaves other sessions untouched', async () => {
    const user = await createUser();
    const phone = await createSession(testDb, user.id, 'phone');
    const laptop = await createSession(testDb, user.id, 'laptop');

    await revokeSession(testDb, phone.token);

    await expect(resolveSession(testDb, laptop.token)).resolves.toMatchObject({ id: user.id });
  });
});

describe('revokeOtherSessions', () => {
  it('keeps the current session and drops the rest', async () => {
    const user = await createUser();
    const current = await createSession(testDb, user.id, 'current');
    const other = await createSession(testDb, user.id, 'other');

    await revokeOtherSessions(testDb, user.id, current.token);

    await expect(resolveSession(testDb, current.token)).resolves.toMatchObject({ id: user.id });
    await expect(resolveSession(testDb, other.token)).resolves.toBe(null);
  });

  it('does not touch sessions belonging to another user', async () => {
    const user = await createUser();
    const intruder = await registerUser(testDb, {
      username: 'otrousuario',
      email: 'otro@example.com',
      password: 'otra-contrasena-larga',
    });
    const mine = await createSession(testDb, user.id, null);
    const theirs = await createSession(testDb, intruder.id, null);

    await revokeOtherSessions(testDb, user.id, mine.token);

    await expect(resolveSession(testDb, theirs.token)).resolves.toMatchObject({ id: intruder.id });
  });
});

describe('deleteExpiredSessions', () => {
  it('removes only the expired rows', async () => {
    const user = await createUser();
    const stale = await createSession(testDb, user.id, null);
    const live = await createSession(testDb, user.id, null);

    await testDb
      .update(schema.sessions)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(schema.sessions.tokenHash, hashToken(stale.token)));

    await deleteExpiredSessions(testDb);

    const remaining = await testDb.select().from(schema.sessions);
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.tokenHash).toBe(hashToken(live.token));
  });
});

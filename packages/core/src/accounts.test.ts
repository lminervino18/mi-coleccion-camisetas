import { beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { schema } from '@camisetas/db';
import { resetDatabase, testDb } from './test-support/database';
import {
  authenticate,
  changePassword,
  deleteAccount,
  registerUser,
  updateProfile,
} from './accounts';
import { DomainError } from './errors';

const credentials = {
  username: 'lminervino18',
  email: 'loren@example.com',
  password: 'una-contrasena-larga',
};

beforeEach(resetDatabase);

describe('registerUser', () => {
  it('stores the password as an argon2id hash and never in clear text', async () => {
    const user = await registerUser(testDb, credentials);

    const [row] = await testDb
      .select({ passwordHash: schema.users.passwordHash })
      .from(schema.users)
      .where(eq(schema.users.id, user.id));

    expect(row?.passwordHash).toMatch(/^\$argon2id\$/);
    expect(row?.passwordHash).not.toContain(credentials.password);
  });

  it('rejects a duplicate username regardless of casing', async () => {
    await registerUser(testDb, credentials);

    const duplicate = registerUser(testDb, {
      ...credentials,
      username: 'LMinervino18',
      email: 'otro@example.com',
    });

    await expect(duplicate).rejects.toThrow(DomainError);
    await expect(duplicate).rejects.toMatchObject({ code: 'conflict' });
  });

  it('rejects a duplicate email', async () => {
    await registerUser(testDb, credentials);
    await expect(
      registerUser(testDb, { ...credentials, username: 'otrousuario' }),
    ).rejects.toMatchObject({ code: 'conflict' });
  });

  it('reports which field collided', async () => {
    await registerUser(testDb, credentials);
    try {
      await registerUser(testDb, { ...credentials, email: 'nuevo@example.com' });
      expect.unreachable('expected a conflict');
    } catch (error) {
      expect((error as DomainError).fieldErrors).toHaveProperty('username');
      expect((error as DomainError).fieldErrors).not.toHaveProperty('email');
    }
  });
});

describe('authenticate', () => {
  beforeEach(async () => {
    await registerUser(testDb, credentials);
  });

  it('accepts the correct password', async () => {
    const user = await authenticate(testDb, credentials.username, credentials.password);
    expect(user.username).toBe(credentials.username);
  });

  it('accepts the username case-insensitively', async () => {
    const user = await authenticate(testDb, 'LMINERVINO18', credentials.password);
    expect(user.username).toBe(credentials.username);
  });

  // This is the regression guard for the legacy defect: login used to issue a token
  // without ever comparing the password.
  it('rejects a wrong password', async () => {
    await expect(
      authenticate(testDb, credentials.username, 'contrasena-incorrecta'),
    ).rejects.toMatchObject({ code: 'unauthenticated' });
  });

  it('rejects an empty password', async () => {
    await expect(authenticate(testDb, credentials.username, '')).rejects.toMatchObject({
      code: 'unauthenticated',
    });
  });

  it('gives the same error for an unknown user as for a wrong password', async () => {
    const unknown = await authenticate(testDb, 'noexiste', 'x').catch((e: DomainError) => e);
    const wrong = await authenticate(testDb, credentials.username, 'x').catch(
      (e: DomainError) => e,
    );
    expect((unknown as DomainError).message).toBe((wrong as DomainError).message);
  });

  it('never exposes the password hash to callers', async () => {
    const user = await authenticate(testDb, credentials.username, credentials.password);
    expect(user).not.toHaveProperty('passwordHash');
  });
});

describe('changePassword', () => {
  it('requires the current password', async () => {
    const user = await registerUser(testDb, credentials);
    await expect(
      changePassword(testDb, user.id, 'no-es-la-actual', 'otra-contrasena-larga'),
    ).rejects.toMatchObject({ code: 'unauthenticated' });
  });

  it('replaces the password so the old one stops working', async () => {
    const user = await registerUser(testDb, credentials);
    await changePassword(testDb, user.id, credentials.password, 'otra-contrasena-larga');

    await expect(
      authenticate(testDb, credentials.username, credentials.password),
    ).rejects.toMatchObject({ code: 'unauthenticated' });
    await expect(
      authenticate(testDb, credentials.username, 'otra-contrasena-larga'),
    ).resolves.toMatchObject({ id: user.id });
  });
});

describe('updateProfile', () => {
  it('refuses a username already taken by someone else', async () => {
    await registerUser(testDb, credentials);
    const other = await registerUser(testDb, {
      username: 'otrousuario',
      email: 'otro@example.com',
      password: 'otra-contrasena-larga',
    });

    await expect(
      updateProfile(testDb, other.id, {
        username: 'LMinervino18',
        email: other.email,
        displayName: null,
      }),
    ).rejects.toMatchObject({ code: 'conflict' });
  });

  it('allows keeping your own username unchanged', async () => {
    const user = await registerUser(testDb, credentials);
    const updated = await updateProfile(testDb, user.id, {
      username: credentials.username,
      email: credentials.email,
      displayName: 'Loren',
    });
    expect(updated.displayName).toBe('Loren');
  });
});

describe('deleteAccount', () => {
  it('requires the password', async () => {
    const user = await registerUser(testDb, credentials);
    await expect(deleteAccount(testDb, user.id, 'incorrecta')).rejects.toMatchObject({
      code: 'unauthenticated',
    });

    const remaining = await testDb.select().from(schema.users);
    expect(remaining).toHaveLength(1);
  });

  it('removes the user when the password is correct', async () => {
    const user = await registerUser(testDb, credentials);
    await deleteAccount(testDb, user.id, credentials.password);
    expect(await testDb.select().from(schema.users)).toHaveLength(0);
  });
});
